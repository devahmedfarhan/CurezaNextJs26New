'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, User, ShieldAlert, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
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
        product_id?: string;
        seller_name?: string;
        type?: string;
    };
    read_at: string | null;
    created_at: string;
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);
    const [bellTab, setBellTab] = useState<'customer' | 'seller' | 'doctor'>('customer');
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isSuperAdmin = typeof window !== 'undefined' && window.location.pathname.includes('/superadmin');

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
            console.error('Error fetching notifications:', error);
        }
    };

    const handleToggle = () => {
        if (!open) {
            void fetchUnreadCount();
            void fetchNotifications();
        }
        setOpen(!open);
    };

    const handleClickNotification = async (notif: NotificationItem) => {
        // Mark as read
        try {
            await api.post('/notifications/read', { id: notif.id });
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (e) {
            console.error(e);
        }

        // Navigate
        const data = notif.data;
        if (data.action_url) {
            router.push(data.action_url);
        } else if (data.product_id) {
            router.push(`/superadmin/dashboard/products/change-requests`);
        } else if (data.ticket_id) {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/superadmin')) {
                router.push(`/superadmin/dashboard/support/${data.ticket_id}`);
            } else if (currentPath.includes('/seller')) {
                router.push(`/seller/dashboard/support/${data.ticket_id}`);
            } else if (currentPath.includes('/doctor')) {
                router.push(`/doctor/dashboard/support/${data.ticket_id}`);
            } else {
                router.push(`/dashboard/support/${data.ticket_id}`);
            }
        }
        setOpen(false);
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/read');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    // Fetch count periodically or on mount
    useEffect(() => {
        const initialLoad = window.setTimeout(() => {
            void fetchUnreadCount();
        }, 0);
        const interval = window.setInterval(() => {
            void fetchUnreadCount();
            if (open) {
                void fetchNotifications();
            }
        }, 15000); // Poll every 15s when active or unread count
        return () => {
            window.clearTimeout(initialLoad);
            window.clearInterval(interval);
        };
    }, [open]);

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

    // Categorize notifications to display gorgeous B&W labels
    const getNotificationBadge = (notif: NotificationItem) => {
        const type = notif.type;
        const dataType = notif.data.type;
        
        if (type.includes('NewProductSubmission') || dataType?.includes('product')) {
            return {
                label: 'PRODUCT',
                bgColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
                icon: <Sparkles size={12} className="text-neutral-700" />
            };
        }
        if (dataType === 'seller_registration' || type.includes('SellerRegistration') || dataType?.includes('seller_registration')) {
            return {
                label: 'NEW SELLER',
                bgColor: 'bg-neutral-900 text-neutral-100 border-neutral-950',
                icon: <User size={12} className="text-neutral-100" />
            };
        }
        if (dataType === 'doctor_registration' || dataType?.includes('doctor')) {
            return {
                label: 'NEW DOCTOR',
                bgColor: 'bg-neutral-900 text-neutral-100 border-neutral-950',
                icon: <User size={12} className="text-neutral-100" />
            };
        }
        if (dataType?.includes('update') || dataType?.includes('change')) {
            return {
                label: 'CHANGE REQ',
                bgColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
                icon: <AlertCircle size={12} className="text-neutral-700" />
            };
        }
        if (type.includes('NewTicket') || type.includes('TicketReply')) {
            return {
                label: 'SUPPORT',
                bgColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
                icon: <HelpCircle size={12} className="text-neutral-700" />
            };
        }
        return {
            label: 'SYSTEM',
            bgColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
            icon: <Info size={12} className="text-neutral-700" />
        };
    };

    // Filter notifications based on the active tab for Super Admins
    const getFilteredNotifications = () => {
        if (!isSuperAdmin) return notifications;

        return notifications.filter(notif => {
            const type = notif.type;
            const dataType = notif.data.type || '';
            
            const isSeller = dataType === 'seller_registration' || dataType === 'product_change' || 
                             type.includes('Seller') || dataType.includes('seller') || 
                             notif.data.action_url?.includes('seller') || notif.data.action_url?.includes('change-requests');
                             
            const isDoctor = dataType === 'doctor_registration' || type.includes('Doctor') || 
                             dataType.includes('doctor') || notif.data.action_url?.includes('doctor');

            if (bellTab === 'seller') return isSeller;
            if (bellTab === 'doctor') return isDoctor;
            return !isSeller && !isDoctor;
        });
    };

    const filteredList = getFilteredNotifications();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative text-neutral-600 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-50 border-[0.5px] border-neutral-950/10 transition-all flex items-center justify-center bg-white"
                aria-label="Toggle notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-950 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none border border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed sm:absolute right-4 left-4 sm:right-0 sm:left-auto mt-2 sm:w-96 bg-white rounded-lg border-[0.5px] border-neutral-950/20 z-50 overflow-hidden flex flex-col max-h-[500px]">
                    {/* Header */}
                    <div className="p-4 border-b-[0.5px] border-neutral-950/10 bg-neutral-50/50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-sm text-neutral-900">Notifications</h3>
                            <p className="text-xs text-neutral-500 mt-0.5">{unreadCount} unread action items</p>
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-[10px] uppercase font-bold tracking-wider text-neutral-900 hover:underline flex items-center gap-1"
                            >
                                <Check size={12} /> Mark read
                            </button>
                        )}
                    </div>

                    {/* Super Admin Tabs */}
                    {isSuperAdmin && (
                        <div className="flex border-b border-neutral-950/10 bg-neutral-50/30 text-[10px] font-bold text-neutral-500">
                            {[
                                { id: 'customer', label: 'Customer' },
                                { id: 'seller', label: 'Seller' },
                                { id: 'doctor', label: 'Doctor' }
                            ].map(tab => {
                                const count = notifications.filter(notif => {
                                    const type = notif.type;
                                    const dataType = notif.data.type || '';
                                    const isSeller = dataType === 'seller_registration' || dataType === 'product_change' || type.includes('Seller') || dataType.includes('seller') || notif.data.action_url?.includes('seller') || notif.data.action_url?.includes('change-requests');
                                    const isDoctor = dataType === 'doctor_registration' || type.includes('Doctor') || dataType.includes('doctor') || notif.data.action_url?.includes('doctor');
                                    if (tab.id === 'seller') return isSeller;
                                    if (tab.id === 'doctor') return isDoctor;
                                    return !isSeller && !isDoctor;
                                }).filter(n => !n.read_at).length;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setBellTab(tab.id as any)}
                                        className={`flex-1 py-2.5 text-center border-b transition-all flex items-center justify-center gap-1.5 ${
                                            bellTab === tab.id 
                                                ? 'border-black text-black bg-white' 
                                                : 'border-transparent hover:text-neutral-700 bg-neutral-50/20'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                            count > 0 
                                                ? 'bg-red-50 text-red-600 border-red-200/60' 
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1 divide-y-[0.5px] divide-neutral-950/10">
                        {filteredList.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <Bell size={24} className="text-neutral-300 mb-2" />
                                <p className="text-sm font-medium text-neutral-800">All caught up!</p>
                                <p className="text-xs text-neutral-400 mt-1">No alerts or action requests in this category.</p>
                            </div>
                        ) : (
                            filteredList.map(notif => {
                                const badge = getNotificationBadge(notif);
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleClickNotification(notif)}
                                        className={`p-4 hover:bg-neutral-50/50 cursor-pointer transition-all flex gap-3 relative ${
                                            !notif.read_at ? 'bg-neutral-50/30 font-semibold' : ''
                                        }`}
                                    >
                                        {!notif.read_at && (
                                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-neutral-950 rounded-full" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${badge.bgColor}`}>
                                                    {badge.icon}
                                                    {badge.label}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-normal ml-auto">
                                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <h4 className="text-xs font-bold text-neutral-900 truncate">
                                                {notif.data.title || 'Notification Alert'}
                                            </h4>
                                            <p className="text-[11px] text-neutral-500 font-normal mt-0.5 line-clamp-2 leading-relaxed">
                                                {notif.data.message || notif.data.title}
                                            </p>
                                            {notif.data.seller_name && (
                                                <p className="text-[10px] text-neutral-400 mt-1 font-normal">
                                                    Seller: {notif.data.seller_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t-[0.5px] border-neutral-950/10 bg-neutral-50/50 text-center">
                        <button
                            onClick={() => {
                                router.push('/superadmin/dashboard/notifications');
                                setOpen(false);
                            }}
                            className="text-xs font-bold text-neutral-800 hover:text-neutral-950 hover:underline"
                        >
                            Open Notification Action Center
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
