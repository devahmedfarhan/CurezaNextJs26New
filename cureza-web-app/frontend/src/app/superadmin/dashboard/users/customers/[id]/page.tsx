'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, CreditCard, Clock, Ban, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useRouter, useParams } from 'next/navigation';

export default function AdminCustomerDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { showToast } = useToast();
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const response = await api.get(`/admin/customers/${id}`);
            setCustomer(response.data);
        } catch (error) {
            console.error('Failed to fetch customer:', error);
            showToast('Failed to load customer details', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading customer details...</div>;
    if (!customer) return <div className="p-8 text-center">Customer not found</div>;

    const addresses = customer.addresses || [];
    const orders = customer.orders || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/superadmin/dashboard/users/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                    <p className="text-gray-500 text-sm">Customer ID: CUST-{customer.id}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Link
                        href={`/superadmin/dashboard/users/create?type=customer&id=${customer.id}&mode=edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                        <Edit size={16} />
                        Edit Profile
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm">
                        <Ban size={16} />
                        Block User
                    </button>
                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                        <Trash2 size={16} />
                        Delete Data
                    </button> */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-xl border-[0.5px] border-black/50 shadow-none space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                            {customer.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-lg">{customer.name}</div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {customer.status || 'Active'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t-[0.5px] border-black/50">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Mail size={18} className="text-gray-400" />
                            <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone size={18} className="text-gray-400" />
                            <span className="text-sm">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Clock size={18} className="text-gray-400" />
                            <span className="text-sm">Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* <div className="pt-4 border-t-[0.5px] border-black/50">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm">Saved Addresses</h3>
                        <div className="space-y-3">
                            {addresses.map((addr: any) => (
                                <div key={addr.id} className="flex items-start gap-3 text-sm text-gray-600">
                                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-medium text-gray-800">{addr.type}:</span> {addr.line} - {addr.zip}
                                    </div>
                                </div>
                            ))}
                            {addresses.length === 0 && <p className="text-sm text-gray-500">No addresses saved.</p>}
                        </div>
                    </div> */}
                </div>

                {/* Stats & Orders */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Spent</p>
                                <h3 className="text-2xl font-bold text-gray-900">₹0</h3>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-xl border-[0.5px] border-black/50 shadow-none overflow-hidden">
                        <div className="p-6 border-b-[0.5px] border-black/50">
                            <h3 className="font-bold text-gray-900">Recent Orders</h3>
                        </div>
                        <div className="p-6 text-center text-gray-500">
                            No orders found.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
