'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NotificationItem {
    id: string;
    type: string;
    data: {
        title?: string;
        message?: string;
        action_url?: string;
        action_url_suffix?: string;
        ticket_id?: string;
    };
    read_at: string | null;
    created_at: string;
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch {
            // Silent fail
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = () => {
        if (!open) {
            fetchUnreadCount();
            fetchNotifications();
        }
        setOpen(!open);
    };

    const handleClickNotification = async (notif: NotificationItem) => {
        // Mark as read
        try {
            await api.post('/notifications/read', { id: notif.id });
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date() } : n));
        } catch (e) {
            console.error(e);
        }

        // Navigate
        if (notif.data.action_url) {
            router.push(notif.data.action_url);
        } else if (notif.data.action_url_suffix) {
            // If sender logic, role checking is complex. 
            // Assume we just append suffix to current dashboard? No, dashboard base varies.
            // But we know if we are admin or user?
            // Safer to use the ID and redirect locally.
            // Or just use the suffix if it is basically the ticket path.
            // ticket path is /dashboard/support/[id] or /superadmin/dashboard/support/[id].
            // We can detect current path to decide?
            const currentPath = window.location.pathname;
            if (currentPath.includes('/superadmin')) {
                router.push(`/superadmin/dashboard/support/${notif.data.ticket_id}`);
            } else if (currentPath.includes('/seller')) {
                router.push(`/seller/dashboard/support/${notif.data.ticket_id}`);
            } else if (currentPath.includes('/doctor')) {
                router.push(`/doctor/dashboard/support/${notif.data.ticket_id}`);
            } else {
                router.push(`/dashboard/support/${notif.data.ticket_id}`);
            }
        }
        setOpen(false);
    };

    // Fetch count periodically or on mount
    useEffect(() => {
        const initialLoad = window.setTimeout(() => {
            void fetchUnreadCount();
        }, 0);
        const interval = window.setInterval(() => {
            void fetchUnreadCount();
        }, 30000); // Poll every 30s
        return () => {
            window.clearTimeout(initialLoad);
            window.clearInterval(interval);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed sm:absolute right-4 left-4 sm:right-0 sm:left-auto mt-2 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-100 font-semibold text-sm flex justify-between">
                        <span>Notifications</span>
                        <button className="text-xs text-blue-600 hover:underline" onClick={() => {
                            api.post('/notifications/read').then(() => {
                                setUnreadCount(0);
                                setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
                            });
                        }}>Mark all read</button>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    ) : (
                        <div>
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleClickNotification(notif)}
                                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notif.read_at ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="text-xs text-gray-800 font-medium mb-1">{notif.data.title || 'Notification'}</div>
                                    <div className="text-xs text-gray-600 line-clamp-2">{notif.data.message}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
