'use client';

import { useState, useEffect } from 'react';
import { Search, Truck, MapPin, Calendar, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Shipment {
    id: number;
    tracking_number: string;
    courier_name: string;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
    pickup_time_slot: string | null;
    shipping_charge: string | number;
    remittance_status: string;
    payout_status: string;
    order: {
        id: number;
        order_number: string;
    };
    seller: {
        id: number;
        name: string;
    };
}

export default function AdminShipmentsPage() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (statusFilter !== 'All') params.status = statusFilter;

            const response = await api.get('/admin/shipments', { params });
            const data = response.data;
            if (data.data) {
                setShipments(data.data);
                setTotalPages(data.last_page);
            } else {
                setShipments(data);
            }
        } catch (error) {
            console.error('Failed to fetch shipments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, [statusFilter, page]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
            case 'pickup_scheduled':
                return 'bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
            case 'picked_up':
                return 'bg-indigo-50 text-indigo-700 border border-indigo-200/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
            case 'out_for_delivery':
                return 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
            default:
                return 'bg-neutral-50 text-neutral-750 border border-neutral-200 dark:bg-neutral-850 dark:text-neutral-350 dark:border-neutral-800';
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-black/50 dark:border-neutral-800">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Truck size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                <Truck size={20} />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                Shipment Tracking
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-normal text-xs">
                            Monitor all shipments from sellers to customers
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none">
                <div className="flex flex-wrap gap-2 text-xs font-medium overflow-x-auto pb-2 sm:pb-0">
                    {['All', 'pickup_scheduled', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-3 py-2 rounded-[10px] border-[0.5px] transition-colors capitalize ${
                                statusFilter === status
                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                    : 'bg-white text-neutral-600 border-black/50 hover:bg-neutral-50 dark:bg-gray-900 dark:text-neutral-350 dark:border-neutral-800 dark:hover:bg-neutral-800'
                            }`}
                        >
                            {status.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Shipments List Table */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-955/10 dark:divide-neutral-800">
                        <thead className="bg-neutral-50/50 dark:bg-gray-850/50">
                            <tr className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Tracking Number</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Order</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Seller</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Courier</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Status</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Pickup Slot</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Shipping Fee</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Remittance (COD)</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Payout Status</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-955/5 dark:divide-gray-850 font-normal text-xs text-gray-700 dark:text-gray-300">
                            {loading ? (
                                <tr><td colSpan={10} className="px-6 py-8 text-center text-neutral-500 font-normal">Loading...</td></tr>
                            ) : shipments.length === 0 ? (
                                <tr><td colSpan={10} className="px-6 py-8 text-center text-neutral-500 font-normal">No shipments found.</td></tr>
                            ) : (
                                shipments.map((shipment) => (
                                    <tr key={shipment.id} className="hover:bg-neutral-50/40 dark:hover:bg-gray-850/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-black dark:text-white">
                                            {shipment.tracking_number || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer">
                                            <Link href={`/superadmin/dashboard/orders/${shipment.order?.id}`}>
                                                {shipment.order?.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-900 dark:text-neutral-100 font-normal">
                                            {shipment.seller?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal">
                                            {shipment.courier_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-semibold rounded-full capitalize ${getStatusColor(shipment.status)}`}>
                                                {shipment.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal">
                                            {shipment.pickup_time_slot || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-900 dark:text-neutral-100 font-semibold">
                                            {shipment.shipping_charge ? `₹${parseFloat(shipment.shipping_charge.toString()).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal capitalize">
                                            {shipment.remittance_status || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal capitalize">
                                            {shipment.payout_status || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                                            {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                                                <select
                                                    onChange={async (e) => {
                                                        const status = e.target.value;
                                                        if (!status) return;
                                                        try {
                                                            await api.post(`/admin/shipments/${shipment.id}/simulate`, { status });
                                                            alert(`Successfully simulated status to ${status.replace(/_/g, ' ')}`);
                                                            fetchShipments();
                                                        } catch (err: any) {
                                                            alert(err.response?.data?.message || 'Failed to simulate status');
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                    className="px-2 py-1 bg-white border-[0.5px] border-black/50 dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded text-[10px] focus:outline-none cursor-pointer"
                                                >
                                                    <option value="">Simulate Status</option>
                                                    <option value="picked_up" disabled={shipment.status === 'picked_up'}>Mark Picked Up</option>
                                                    <option value="out_for_delivery" disabled={shipment.status === 'out_for_delivery' || shipment.status === 'pickup_scheduled'}>Mark Out for Delivery</option>
                                                    <option value="delivered" disabled={shipment.status === 'delivered' || shipment.status === 'pickup_scheduled'}>Mark Delivered</option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-3 flex justify-between items-center border-t-[0.5px] border-black/50 dark:border-neutral-800 text-xs">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                    >
                        Previous
                    </button>
                    <span className="text-neutral-500 dark:text-neutral-450 font-normal">Page {page} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
