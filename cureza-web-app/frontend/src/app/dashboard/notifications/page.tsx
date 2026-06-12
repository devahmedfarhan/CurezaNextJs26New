'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Bell, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id?: string) => {
        try {
            await api.post('/notifications/read', id ? { id } : {});

            // Optimistic update
            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
                fetchNotifications(); // Refresh to be sure or just optimistic
            }
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading notifications...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100 flex items-center gap-2">
                    <Bell className="text-cureza-green" /> Notifications
                </h1>
                {notifications.some(n => !n.read_at) && (
                    <button
                        onClick={() => markAsRead()}
                        className="text-sm text-cureza-green hover:underline font-medium"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Bell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 flex gap-4 ${!notification.read_at ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                            >
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read_at ? 'bg-cureza-green' : 'bg-transparent'}`} />

                                <div className="flex-1 space-y-1">
                                    <h4 className={`text-sm font-medium ${!notification.read_at ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {/* Assuming standard Laravel notification structure where title/message is in data */}
                                        {notification.data?.title || notification.type.split('\\').pop()}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {notification.data?.message || JSON.stringify(notification.data)}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>

                                {!notification.read_at && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-2 text-gray-400 hover:text-cureza-green hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors self-start"
                                        title="Mark as read"
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
