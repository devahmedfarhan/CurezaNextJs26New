'use client';

import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Notification {
    id: string;
    type: string;
    data: {
        type?: string;
        title: string;
        message: string;
        action_url?: string;
        order_number?: string;
        customer_name?: string;
        total_amount?: number;
        product_count?: number;
    };
    read_at: string | null;
    created_at: string;
}

export default function SellerNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id?: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/notifications/read`,
                id ? { id } : {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        if (notification.data.action_url) {
            router.push(notification.data.action_url);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cureza-green mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading notifications...</p>
                </div>
            </div>
        );
    }

    const unreadNotifications = notifications.filter(n => !n.read_at);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 mt-1">
                        {unreadNotifications.length > 0
                            ? `You have ${unreadNotifications.length} unread notification${unreadNotifications.length > 1 ? 's' : ''}`
                            : 'All caught up!'}
                    </p>
                </div>
                {unreadNotifications.length > 0 && (
                    <button
                        onClick={() => markAsRead()}
                        className="flex items-center gap-2 px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Check size={18} />
                        Mark All as Read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Bell size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                    <p className="text-gray-500">
                        You'll see notifications here when customers place orders or when there are updates to your products.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read_at ? 'bg-green-50/30' : ''
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${!notification.read_at ? 'bg-cureza-green' : 'bg-transparent'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className={`text-base font-medium ${!notification.read_at ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                    {notification.data.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.data.message}
                                                </p>

                                                {/* Order Details */}
                                                {notification.data.type === 'new_order' && (
                                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            {notification.data.order_number && (
                                                                <div>
                                                                    <span className="text-gray-500">Order:</span>
                                                                    <span className="ml-2 font-medium text-gray-900">
                                                                        {notification.data.order_number}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notification.data.customer_name && (
                                                                <div>
                                                                    <span className="text-gray-500">Customer:</span>
                                                                    <span className="ml-2 font-medium text-gray-900">
                                                                        {notification.data.customer_name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notification.data.total_amount !== undefined && (
                                                                <div>
                                                                    <span className="text-gray-500">Amount:</span>
                                                                    <span className="ml-2 font-medium text-green-600">
                                                                        ₹{notification.data.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {notification.data.product_count !== undefined && (
                                                                <div>
                                                                    <span className="text-gray-500">Items:</span>
                                                                    <span className="ml-2 font-medium text-gray-900">
                                                                        {notification.data.product_count}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-xs text-gray-400 mt-3">
                                                    {new Date(notification.created_at).toLocaleString('en-IN', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </p>
                                            </div>

                                            {!notification.read_at && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                    className="flex-shrink-0 p-2 text-gray-400 hover:text-cureza-green hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
