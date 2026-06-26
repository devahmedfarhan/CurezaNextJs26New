'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Info, 
  User, 
  Sparkles, 
  AlertCircle, 
  HelpCircle, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  Search,
  Filter,
  Trash2,
  Inbox
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
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

export default function SuperAdminNotificationsPage() {
    const { showToast } = useToast();
    const router = useRouter();
    
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'customer' | 'seller' | 'doctor'>('customer');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            showToast('Failed to fetch live notifications from database', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.post('/notifications/read', { id });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            showToast('Notification marked as read', 'success');
        } catch (err) {
            console.error('Failed to mark read:', err);
            showToast('Failed to update status', 'error');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post('/notifications/read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            showToast('All notifications marked as read', 'success');
        } catch (err) {
            console.error('Failed to mark all read:', err);
            showToast('Failed to update statuses', 'error');
        }
    };

    const handleActionClick = (notif: NotificationItem) => {
        // Mark as read
        if (!notif.read_at) {
            void handleMarkAsRead(notif.id);
        }

        const data = notif.data;
        if (data.action_url) {
            router.push(data.action_url);
        } else if (data.product_id) {
            router.push(`/superadmin/dashboard/products/change-requests`);
        } else if (data.ticket_id) {
            router.push(`/superadmin/dashboard/support/${data.ticket_id}`);
        } else {
            router.push(`/superadmin/dashboard`);
        }
    };

    // Filter notifications based on tab & search
    const filteredNotifications = notifications.filter(notif => {
        const textMatch = (notif.data.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (notif.data.message || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!textMatch) return false;

        const type = notif.type;
        const dataType = notif.data.type || '';

        // Categorize into Customer, Seller, Doctor
        const isSeller = dataType === 'seller_registration' || dataType === 'product_change' || 
                         type.includes('Seller') || dataType.includes('seller') || 
                         notif.data.action_url?.includes('seller') || notif.data.action_url?.includes('change-requests');

        const isDoctor = dataType === 'doctor_registration' || type.includes('Doctor') || 
                         dataType.includes('doctor') || notif.data.action_url?.includes('doctor');

        if (activeTab === 'seller') return isSeller;
        if (activeTab === 'doctor') return isDoctor;
        
        // Customer is everything else (orders, tickets, review, system)
        return !isSeller && !isDoctor;
    });

    const getNotificationIcon = (notif: NotificationItem) => {
        const type = notif.type;
        const dataType = notif.data.type;
        
        if (type.includes('NewProductSubmission') || dataType?.includes('product')) {
            return <Sparkles size={16} className="text-neutral-700" />;
        }
        if (dataType?.includes('registration') || type.includes('Registration')) {
            return <User size={16} className="text-neutral-700" />;
        }
        if (type.includes('NewTicket') || type.includes('TicketReply')) {
            return <HelpCircle size={16} className="text-neutral-700" />;
        }
        return <Info size={16} className="text-neutral-700" />;
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Notification Action Center</h1>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">Review and resolve live Customer, Seller, and Doctor system alerts.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={fetchNotifications}
                        className="bg-white border-[0.5px] border-black/50 text-gray-700 px-4 py-2.5 rounded-[10px] text-xs font-semibold hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
                    >
                        Refresh Feed
                    </button>
                    {notifications.some(n => !n.read_at) && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="bg-black text-white px-4 py-2.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-900 transition-colors"
                        >
                            <Check size={14} /> Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Tab Panel */}
            <div className="flex border-b border-black/10">
                {[
                    { id: 'customer', label: 'Customer Alerts' },
                    { id: 'seller', label: 'Seller Alerts' },
                    { id: 'doctor', label: 'Doctor Alerts' }
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
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                                activeTab === tab.id 
                                    ? 'border-black text-black' 
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border transition-colors ${
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

            {/* Search and Filters toolbar */}
            <div className="flex gap-3 bg-white p-4 rounded-[10px] border-[0.5px] border-black/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search alerts by title or description details..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:border-black outline-none transition-colors font-medium"
                    />
                </div>
            </div>

            {/* Main Notifications Log List */}
            {loading ? (
                <div className="flex h-64 items-center justify-center bg-white border-[0.5px] border-black/50 rounded-[10px]">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-black" size={32} />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading DB notification logs...</p>
                    </div>
                </div>
            ) : filteredNotifications.length === 0 ? (
                <div className="p-16 text-center max-w-sm mx-auto space-y-4 bg-white border-[0.5px] border-black/50 rounded-[10px]">
                    <div className="w-12 h-12 bg-neutral-50 text-neutral-400 rounded-full flex items-center justify-center mx-auto border-[0.5px] border-black/50">
                        <Inbox size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">No Alerts Found</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">There are no pending unread notifications in this filter tab.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map(notif => (
                        <div 
                            key={notif.id}
                            className={`bg-white rounded-[10px] border-[0.5px] border-black/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-black ${
                                !notif.read_at ? 'shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''
                            }`}
                        >
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-2.5 bg-neutral-50 border-[0.5px] border-black/50 rounded-[10px] mt-0.5 shrink-0 text-black">
                                    {getNotificationIcon(notif)}
                                </div>
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-sm text-gray-900 truncate">{notif.data.title || 'Notification alert'}</h3>
                                        {!notif.read_at && (
                                            <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                New Action
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 font-normal">
                                            {new Date(notif.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-550 leading-relaxed font-normal">{notif.data.message || notif.data.title}</p>
                                    {notif.data.seller_name && (
                                        <p className="text-[10px] text-gray-450 font-normal">Vendor Store: <span className="font-semibold">{notif.data.seller_name}</span></p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 self-end md:self-center shrink-0">
                                {!notif.read_at && (
                                    <button
                                        onClick={() => handleMarkAsRead(notif.id)}
                                        className="p-2 bg-white hover:bg-neutral-50 rounded-[10px] border-[0.5px] border-black/50 text-gray-700 hover:text-black font-semibold text-xs transition-colors"
                                        title="Mark read"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleActionClick(notif)}
                                    className="px-4 py-2 bg-black hover:bg-neutral-900 text-white rounded-[10px] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                                >
                                    Take Action
                                    <ArrowRight size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
