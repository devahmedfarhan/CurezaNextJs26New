'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Mail, 
    MessageSquare, 
    Bell, 
    Edit, 
    Plus, 
    Trash2, 
    Settings, 
    Clock, 
    List, 
    Activity, 
    RefreshCw, 
    CheckCircle, 
    AlertCircle, 
    Send, 
    Eye, 
    Save, 
    Search,
    ChevronRight,
    UserPlus,
    Check,
    X,
    HelpCircle,
    Sliders
} from 'lucide-react';

interface Template {
    id: number;
    name: string;
    code: string;
    flow: 'order' | 'abandoned_cart' | 'restock' | 'reminder';
    channel: 'email' | 'whatsapp';
    subject: string | null;
    content: string;
    trigger_type: 'event' | 'delay';
    delay_value: number;
    delay_unit: 'hours' | 'days';
    status: 'active' | 'inactive';
    whatsapp_template_name: string | null;
    whatsapp_status: 'approved' | 'pending' | 'rejected';
    variables: string[];
}

interface LogEntry {
    id: number;
    recipient_email: string | null;
    recipient_phone: string | null;
    recipient_name: string | null;
    template_code: string;
    flow: string;
    channel: string;
    subject: string | null;
    content: string;
    status: 'sent' | 'failed' | 'queued';
    error_message: string | null;
    sent_at: string;
    created_at: string;
}

interface WaitlistSubscriber {
    id: number;
    product_id: number;
    product: {
        id: number;
        name: string;
        image?: string;
    };
    email: string;
    phone: string | null;
    notified: boolean;
    created_at: string;
}

interface ProductInfo {
    id: number;
    name: string;
}

function NotificationSettingsContent() {
    const [activeTab, setActiveTab] = useState<'templates' | 'flows' | 'waitlist' | 'whatsapp' | 'logs' | 'guide'>('templates');
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab');

    useEffect(() => {
        if (tabParam && ['templates', 'flows', 'waitlist', 'whatsapp', 'logs', 'guide'].includes(tabParam)) {
            setActiveTab(tabParam as any);
        }
    }, [tabParam]);

    const handleTabChange = (newTab: 'templates' | 'flows' | 'waitlist' | 'whatsapp' | 'logs' | 'guide') => {
        setActiveTab(newTab);
        router.push(`/superadmin/dashboard/settings/notifications?tab=${newTab}`);
    };
    
    // Data States
    const [templates, setTemplates] = useState<Template[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [waitlist, setWaitlist] = useState<WaitlistSubscriber[]>([]);
    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [stats, setStats] = useState({
        total_sent: 0,
        total_failed: 0,
        total_queued: 0,
        active_templates: 0,
        total_templates: 0,
        waitlist_subscribers: 0,
        flow_stats: {} as Record<string, number>,
        channel_stats: {} as Record<string, number>
    });

    // Loading & Operation States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Pagination & Search States
    const [searchLog, setSearchLog] = useState('');
    const [searchWaitlist, setSearchWaitlist] = useState('');
    const [logPage, setLogPage] = useState(1);
    const [waitlistPage, setWaitlistPage] = useState(1);
    const [logTotalPages, setLogTotalPages] = useState(1);
    const [waitlistTotalPages, setWaitlistTotalPages] = useState(1);

    // Modal States
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
    const [testRecipient, setTestRecipient] = useState({ email: '', phone: '', name: 'Valued Customer' });
    const [testModalOpen, setTestModalOpen] = useState(false);
    const [logDetailsModal, setLogDetailsModal] = useState<LogEntry | null>(null);
    const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
    const [newWaitlistEntry, setNewWaitlistEntry] = useState({ product_id: '', email: '', phone: '' });

    // WhatsApp API Credentials state
    const [whatsappSettings, setWhatsappSettings] = useState({
        whatsapp_provider: 'aisensy',
        whatsapp_aisensy_api_key: '',
        whatsapp_sender_number: '',
        whatsapp_enabled: '0'
    });
    const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

    // Ref for editor cursor insertion
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        loadStats();
        loadTemplates();
        if (activeTab === 'logs') loadLogs();
        if (activeTab === 'waitlist') {
            loadWaitlist();
            loadProducts();
        }
        if (activeTab === 'whatsapp') loadWhatsappSettings();
    }, [activeTab, logPage, waitlistPage]);

    // Fetch API Functions
    const loadStats = async () => {
        try {
            const res = await api.get('/admin/notifications/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load notification stats', err);
        }
    };

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/notifications/templates');
            setTemplates(res.data);
        } catch (err) {
            setErrorMessage('Failed to load notification templates.');
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/notifications/logs?page=${logPage}&search=${searchLog}`);
            setLogs(res.data.data);
            setLogTotalPages(res.data.last_page);
        } catch (err) {
            setErrorMessage('Failed to load notification log files.');
        } finally {
            setLoading(false);
        }
    };

    const loadWaitlist = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/notifications/waitlist?page=${waitlistPage}&search=${searchWaitlist}`);
            setWaitlist(res.data.data);
            setWaitlistTotalPages(res.data.last_page);
        } catch (err) {
            setErrorMessage('Failed to load restock waitlist.');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data.data || res.data || []);
        } catch (err) {
            console.error('Failed to load products list', err);
        }
    };

    const loadWhatsappSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/settings');
            const data = res.data;
            const settingsObj = { ...whatsappSettings };
            
            if (data.whatsapp) {
                data.whatsapp.forEach((item: any) => {
                    if (item.key in settingsObj) {
                        settingsObj[item.key as keyof typeof whatsappSettings] = item.value || '';
                    }
                });
            }
            setWhatsappSettings(settingsObj);
        } catch (err) {
            setErrorMessage('Failed to load WhatsApp API settings.');
        } finally {
            setLoading(false);
        }
    };

    // Save WhatsApp API Configuration
    const handleSaveWhatsappSettings = async () => {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        const settingsArray = Object.keys(whatsappSettings).map((key) => ({
            key,
            value: whatsappSettings[key as keyof typeof whatsappSettings],
        }));

        try {
            await api.post('/admin/settings', { settings: settingsArray });
            setSuccessMessage('WhatsApp API connection configuration updated successfully!');
            loadStats();
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    // Simulate WhatsApp Integration Ping Status
    const handleTestWhatsAppPing = () => {
        setPingStatus('testing');
        setTimeout(() => {
            if (whatsappSettings.whatsapp_aisensy_api_key.trim().length > 5) {
                setPingStatus('success');
            } else {
                setPingStatus('failed');
            }
        }, 1500);
    };

    // Template Save Operations
    const handleSaveTemplate = async (templateData: any) => {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            if (templateData.id) {
                await api.put(`/admin/notifications/templates/${templateData.id}`, templateData);
                setSuccessMessage(`Template "${templateData.name}" updated successfully.`);
            } else {
                await api.post('/admin/notifications/templates', templateData);
                setSuccessMessage(`New template "${templateData.name}" created.`);
            }
            setEditorOpen(false);
            loadTemplates();
            loadStats();
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to save template changes.');
        } finally {
            setSaving(false);
        }
    };

    // Toggle template active status directly
    const handleToggleStatus = async (tmpl: Template) => {
        try {
            const nextStatus = tmpl.status === 'active' ? 'inactive' : 'active';
            const updated = { ...tmpl, status: nextStatus };
            await api.put(`/admin/notifications/templates/${tmpl.id}`, updated);
            
            setTemplates(templates.map(t => t.id === tmpl.id ? { ...t, status: nextStatus } : t));
            setSuccessMessage(`Template ${tmpl.name} turned ${nextStatus}.`);
            loadStats();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setErrorMessage('Failed to update template status.');
        }
    };

    // Send Test Dispatch Call
    const handleSendTest = async () => {
        if (!selectedTemplate) return;
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const payload = selectedTemplate.channel === 'email' 
                ? { email: testRecipient.email, name: testRecipient.name }
                : { phone: testRecipient.phone, name: testRecipient.name };

            const res = await api.post(`/admin/notifications/templates/${selectedTemplate.id}/test`, payload);
            setSuccessMessage(res.data.message || 'Test notification dispatched successfully!');
            setTestModalOpen(false);
            loadStats();
        } catch (err: any) {
            setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Test dispatch failed.');
        } finally {
            setSaving(false);
        }
    };

    // Trigger Automated flows manually
    const handleTriggerCronFlows = async () => {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const res = await api.post('/admin/notifications/flows/trigger-test');
            setSuccessMessage('Evaluation completed. Logs have been generated for matching flows.');
            loadStats();
            if (activeTab === 'logs') loadLogs();
        } catch (err) {
            setErrorMessage('Failed to trigger flow evaluations.');
        } finally {
            setSaving(false);
        }
    };

    // Add waitlist subscriber manually
    const handleAddWaitlist = async () => {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await api.post('/admin/notifications/waitlist', newWaitlistEntry);
            setSuccessMessage('Subscriber successfully registered for restock notification.');
            setWaitlistModalOpen(false);
            setNewWaitlistEntry({ product_id: '', email: '', phone: '' });
            loadWaitlist();
            loadStats();
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to add waitlist entry.');
        } finally {
            setSaving(false);
        }
    };

    // Remove waitlist entry
    const handleRemoveWaitlist = async (id: number) => {
        if (!confirm('Are you sure you want to remove this waitlist signup?')) return;
        try {
            await api.delete(`/admin/notifications/waitlist/${id}`);
            setWaitlist(waitlist.filter(w => w.id !== id));
            loadStats();
        } catch (err) {
            setErrorMessage('Failed to remove waitlist entry.');
        }
    };

    // Notify product restock manually
    const handleNotifyRestock = async (productId: number) => {
        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const res = await api.post('/admin/notifications/waitlist/notify-product', { product_id: productId });
            setSuccessMessage(res.data.message || 'Subscribers notified successfully.');
            loadWaitlist();
            loadStats();
        } catch (err) {
            setErrorMessage('Failed to trigger restock notifications.');
        } finally {
            setSaving(false);
        }
    };

    // Clear logs database
    const handleClearLogs = async () => {
        if (!confirm('Are you sure you want to delete all historical logs? This cannot be undone.')) return;
        try {
            await api.delete('/admin/notifications/logs/clear');
            setLogs([]);
            loadStats();
        } catch (err) {
            setErrorMessage('Failed to clear logs.');
        }
    };

    // Helper: Insert placeholder text in editor at current cursor
    const handleInsertPlaceholder = (placeholderName: string) => {
        const textarea = textareaRef.current;
        if (!textarea || !selectedTemplate) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const tag = `{{${placeholderName}}}`;
        
        const updatedContent = text.substring(0, start) + tag + text.substring(end);
        
        setSelectedTemplate({
            ...selectedTemplate,
            content: updatedContent
        });

        // Set cursor focus back to textarea after React updates state
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + tag.length, start + tag.length);
        }, 50);
    };

    // Parse live template preview with mock data
    const getLivePreview = (template: Template) => {
        let content = template.content;
        const mockData = {
            customer_name: 'Rahul Sharma',
            order_id: 'CZ20261802',
            order_amount: '3,499.00',
            payment_status: 'Paid (Razorpay)',
            carrier: 'BlueDart Air',
            tracking_number: 'BD88200192',
            est_delivery_date: '22-Jun-2026',
            tracking_link: 'https://bluedart.com/track',
            review_link: 'https://cureza.in/product/ashwagandha#reviews',
            cart_link: 'https://cureza.in/cart',
            product_name: 'Organic Ashwagandha Extract Capsule',
            product_link: 'https://cureza.in/product/ashwagandha',
            unsubscribe_link: 'https://cureza.in/unsubscribe'
        };

        Object.keys(mockData).forEach((key) => {
            const placeholder = `{{${key}}}`;
            content = content.replaceAll(placeholder, mockData[key as keyof typeof mockData]);
        });

        if (template.channel === 'email') {
            // Build temporary HTML iframe payload
            const emailSubject = template.subject ? template.subject.replace('{{order_id}}', 'CZ20261802') : '';
            return (
                <div className="space-y-4">
                    <div className="border-[0.5px] border-black/10 rounded-[10px] p-3 bg-neutral-50">
                        <p className="text-[10px] text-neutral-500 font-medium">Subject Line:</p>
                        <p className="text-xs font-semibold text-neutral-900 mt-0.5">{emailSubject || '(No Subject Line)'}</p>
                    </div>
                    <div className="border-[0.5px] border-black/10 rounded-[10px] overflow-hidden bg-white">
                        <div className="bg-neutral-50 px-4 py-2 border-b-[0.5px] border-black/10 flex items-center justify-between">
                            <span className="text-xs text-neutral-500 font-mono">HTML Sandbox Container</span>
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-neutral-300 rounded-full"></span>
                                <span className="w-2 h-2 bg-neutral-250 rounded-full"></span>
                                <span className="w-2 h-2 bg-neutral-200 rounded-full"></span>
                            </div>
                        </div>
                        <iframe 
                            srcDoc={content} 
                            title="Email Render Preview" 
                            className="w-full min-h-[400px] border-0"
                        />
                    </div>
                </div>
            );
        } else {
            // Render as a WhatsApp chat bubble
            return (
                <div className="bg-neutral-50 p-6 rounded-[10px] border-[0.5px] border-black/10 min-h-[350px] flex flex-col justify-end relative font-sans">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white text-[10px] px-3 py-1 text-neutral-500 rounded-[10px] font-medium border-[0.5px] border-black/10">
                        Messages are simulated through AISensy API
                    </div>
                    <div className="max-w-[85%] bg-white rounded-[10px] border-[0.5px] border-black/10 p-3.5 self-start text-[13px] text-neutral-800 leading-relaxed relative">
                        {template.whatsapp_template_name && (
                            <div className="text-[10px] text-neutral-500 font-medium mb-1.5">
                                Campaign: {template.whatsapp_template_name}
                            </div>
                        )}
                        <div className="whitespace-pre-line font-normal text-neutral-900">
                            {content}
                        </div>
                        <div className="text-right text-[10px] text-neutral-400 mt-2 flex justify-end items-center gap-0.5">
                            12:00 PM <Check size={12} className="text-neutral-500" />
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="space-y-6 pb-20 font-sans text-neutral-900">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-[0.5px] border-black/10 pb-5">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
                        <Sliders className="text-black" size={22} /> Notifications & Flows
                    </h1>
                    <p className="text-neutral-500 text-xs mt-1">
                        Full-control system for email SMTP and WhatsApp AISensy campaign dispatches
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={handleTriggerCronFlows}
                        disabled={saving}
                        className="bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2 border-[0.5px] border-black/10 rounded-[10px] flex items-center gap-2 text-xs font-medium transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={saving ? 'animate-spin' : ''} />
                        Run Flows Evaluation
                    </button>
                    <button 
                        onClick={() => {
                            setSelectedTemplate({
                                id: 0,
                                name: '',
                                code: '',
                                flow: 'order',
                                channel: 'email',
                                subject: '',
                                content: '',
                                trigger_type: 'event',
                                delay_value: 0,
                                delay_unit: 'hours',
                                status: 'active',
                                whatsapp_template_name: '',
                                whatsapp_status: 'approved',
                                variables: ['customer_name']
                            });
                            setPreviewMode('edit');
                            setEditorOpen(true);
                        }}
                        className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] flex items-center gap-2 text-xs font-medium transition-all"
                    >
                        <Plus size={14} />
                        New Template
                    </button>
                </div>
            </div>

            {/* Alert messages */}
            {successMessage && (
                <div className="bg-green-50 border-l-[0.5px] border-black/50 p-4 rounded-[10px] flex items-center gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                    <span className="text-green-800 text-xs font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-[0.5px] border-black/50 p-4 rounded-[10px] flex items-center gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                    <span className="text-red-800 text-xs font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-[10px] border-[0.5px] border-black/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500">Campaigns Sent</p>
                        <h3 className="text-xl font-semibold text-neutral-900 mt-1">{stats.total_sent}</h3>
                        <p className="text-[10px] text-green-600 font-medium mt-1">Successfully dispatched</p>
                    </div>
                    <div className="p-2.5 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/10 rounded-[10px]">
                        <Send size={18} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-[10px] border-[0.5px] border-black/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500">Failed Dispatches</p>
                        <h3 className="text-xl font-semibold text-neutral-900 mt-1">{stats.total_failed}</h3>
                        <p className="text-[10px] text-red-500 font-medium mt-1">Errors logged in history</p>
                    </div>
                    <div className="p-2.5 bg-red-50/50 text-red-600 border-[0.5px] border-black/50 rounded-[10px]">
                        <AlertCircle size={18} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-[10px] border-[0.5px] border-black/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500">Restock Waitlist</p>
                        <h3 className="text-xl font-semibold text-neutral-900 mt-1">{stats.waitlist_subscribers}</h3>
                        <p className="text-[10px] text-neutral-500 font-medium mt-1">Customers waiting for stock</p>
                    </div>
                    <div className="p-2.5 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/10 rounded-[10px]">
                        <Clock size={18} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-[10px] border-[0.5px] border-black/10 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-neutral-500">Active Templates</p>
                        <h3 className="text-xl font-semibold text-neutral-900 mt-1">{stats.active_templates} <span className="text-xs font-normal text-neutral-450">/ {stats.total_templates}</span></h3>
                        <p className="text-[10px] text-neutral-500 font-medium mt-1">Templates actively running</p>
                    </div>
                    <div className="p-2.5 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/10 rounded-[10px]">
                        <Activity size={18} />
                    </div>
                </div>
            </div>

            {/* TAB CONTENT SANDBOX */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 p-6">
                
                {/* 1. TEMPLATES TAB */}
                {activeTab === 'templates' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b-[0.5px] border-black/10 pb-3">
                            <h3 className="font-semibold text-neutral-900 text-base">Notification Templates</h3>
                            <p className="text-xs text-neutral-500 font-normal">Click on any template to preview, edit copy parameters, or run dispatches.</p>
                        </div>

                        {loading && templates.length === 0 ? (
                            <div className="py-10 text-center text-neutral-500 flex flex-col justify-center items-center gap-2">
                                <RefreshCw size={20} className="animate-spin text-neutral-450" />
                                <span className="text-xs font-normal">Loading template registries...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['order', 'abandoned_cart', 'restock', 'reminder'].map((flowType) => {
                                    const flowTemplates = templates.filter(t => t.flow === flowType);
                                    if (flowTemplates.length === 0) return null;

                                    const flowLabels: Record<string, string> = {
                                        order: '📦 Order Confirmation & Updates',
                                        abandoned_cart: '🛒 Abandoned Cart Recovery Sequences',
                                        restock: '🔔 Back-In-Stock Waitlist Triggers',
                                        reminder: '⏰ Feedback & Repeat Purchase Reminders'
                                    };

                                    return (
                                        <div key={flowType} className="border-[0.5px] border-black/10 rounded-[10px] p-5 bg-neutral-50/30 space-y-4">
                                            <h4 className="font-medium text-neutral-800 text-xs border-b-[0.5px] border-black/10 pb-2">
                                                {flowLabels[flowType] || flowType}
                                            </h4>
                                            <div className="space-y-3">
                                                {flowTemplates.map((tmpl) => (
                                                    <div 
                                                        key={tmpl.id} 
                                                        className="bg-white border-[0.5px] border-black/10 rounded-[10px] p-4 transition-all hover:border-black/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                                    >
                                                        <div className="space-y-1.5 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm text-neutral-900">{tmpl.name}</span>
                                                                <span className="text-[10px] px-2 py-0.5 rounded-[10px] font-medium border-[0.5px] border-black/10 bg-neutral-50 text-neutral-800 flex items-center gap-1">
                                                                    {tmpl.channel === 'email' ? <Mail size={10} /> : <MessageSquare size={10} />}
                                                                    {tmpl.channel === 'email' ? 'Email' : 'WhatsApp'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 font-mono font-normal truncate max-w-xs sm:max-w-md">
                                                                Code: {tmpl.code}
                                                            </p>
                                                            {tmpl.trigger_type === 'delay' && (
                                                                <p className="text-[11px] text-neutral-550 font-normal flex items-center gap-1">
                                                                    <Clock size={11} /> Delay: {tmpl.delay_value} {tmpl.delay_unit}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2.5 self-end sm:self-center">
                                                            {/* Status Toggle */}
                                                            <button
                                                                onClick={() => handleToggleStatus(tmpl)}
                                                                className={`text-[10px] px-2.5 py-1 rounded-[10px] font-medium border-[0.5px] transition-all ${
                                                                    tmpl.status === 'active' 
                                                                        ? 'bg-green-50 text-green-700 border-black/50 hover:bg-green-100/50' 
                                                                        : 'bg-neutral-50 text-neutral-600 border-black/10 hover:bg-neutral-100'
                                                                }`}
                                                            >
                                                                {tmpl.status === 'active' ? 'Active' : 'Inactive'}
                                                            </button>

                                                            {/* Actions */}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedTemplate({ ...tmpl });
                                                                    setPreviewMode('edit');
                                                                    setEditorOpen(true);
                                                                }}
                                                                className="text-neutral-500 hover:text-black p-1.5 rounded-[10px] hover:bg-neutral-50 border-[0.5px] border-transparent hover:border-black/5 transition"
                                                                title="Edit content & rules"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedTemplate(tmpl);
                                                                    setTestModalOpen(true);
                                                                }}
                                                                className="text-neutral-550 hover:text-black p-1.5 rounded-[10px] hover:bg-neutral-50 border-[0.5px] border-transparent hover:border-black/5 transition"
                                                                title="Trigger test message"
                                                            >
                                                                <Send size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. AUTOMATED FLOWS CONFIG */}
                {activeTab === 'flows' && (
                    <div className="space-y-6">
                        <div className="border-b-[0.5px] border-black/10 pb-3">
                            <h3 className="font-semibold text-neutral-900 text-base">Automated Triggers Configuration</h3>
                            <p className="text-neutral-500 text-xs mt-1">Configure intervals and conditions for automatic system schedules</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Abandoned Cart Box */}
                            <div className="border-[0.5px] border-black/10 rounded-[10px] p-5 bg-neutral-50/30 space-y-4">
                                <h4 className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                                    <Clock className="text-black" size={18} />
                                    Abandoned Cart Sequences
                                </h4>
                                <p className="text-xs text-neutral-500 font-normal">
                                    Triggered automatically when a registered user leaves items in their shopping cart without completing an order.
                                </p>
                                
                                <div className="space-y-4 bg-white p-4 rounded-[10px] border-[0.5px] border-black/10">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-neutral-800">Step 1: Soft Warning</p>
                                            <p className="text-[10px] text-neutral-450 font-normal">Friendly reminder of cart items</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                defaultValue="1" 
                                                className="w-12 px-2 py-1 text-xs border-[0.5px] border-black/10 bg-neutral-50 rounded-[10px] text-center text-neutral-600" 
                                                disabled 
                                            />
                                            <span className="text-xs text-neutral-650 font-medium">hour(s)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t-[0.5px] border-black/10 pt-3">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-neutral-800">Step 2: Incentivized Recovery</p>
                                            <p className="text-[10px] text-neutral-450 font-normal">Dispatches 10% coupon code (CUREZA10)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                defaultValue="24" 
                                                className="w-12 px-2 py-1 text-xs border-[0.5px] border-black/10 bg-neutral-50 rounded-[10px] text-center text-neutral-600" 
                                                disabled 
                                            />
                                            <span className="text-xs text-neutral-650 font-medium">hour(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Loyalty Box */}
                            <div className="border-[0.5px] border-black/10 rounded-[10px] p-5 bg-neutral-50/30 space-y-4">
                                <h4 className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                                    <Activity className="text-black" size={18} />
                                    Loyalty & Retention Reminders
                                </h4>
                                <p className="text-xs text-neutral-500 font-normal">
                                    Follow-up events triggered relative to delivery and order status changes.
                                </p>
                                
                                <div className="space-y-4 bg-white p-4 rounded-[10px] border-[0.5px] border-black/10">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-neutral-800">Review Request Alert</p>
                                            <p className="text-[10px] text-neutral-450 font-normal">Sent after package is delivered</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                defaultValue="3" 
                                                className="w-12 px-2 py-1 text-xs border-[0.5px] border-black/10 bg-neutral-50 rounded-[10px] text-center text-neutral-600" 
                                                disabled 
                                            />
                                            <span className="text-xs text-neutral-650 font-medium">day(s)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t-[0.5px] border-black/10 pt-3">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-neutral-800">Replenishment Reminder</p>
                                            <p className="text-[10px] text-neutral-450 font-normal">Suggest re-purchasing wellness products</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                defaultValue="30" 
                                                className="w-12 px-2 py-1 text-xs border-[0.5px] border-black/10 bg-neutral-50 rounded-[10px] text-center text-neutral-600" 
                                                disabled 
                                            />
                                            <span className="text-xs text-neutral-650 font-medium">day(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-50 border-[0.5px] border-black/10 p-4 rounded-[10px] flex gap-3 text-xs text-neutral-600">
                            <HelpCircle className="text-neutral-500 flex-shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="font-medium text-neutral-900">Scheduler Information</p>
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                    These delays are registered via Laravel Scheduler commands. You can adjust the exact delay values on a per-template basis directly by clicking Edit on a template in the Campaign Templates tab.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. PRODUCT WAITLIST TAB */}
                {activeTab === 'waitlist' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-[0.5px] border-black/10 pb-3">
                            <div>
                                <h3 className="font-semibold text-neutral-900 text-base">Product Restock Waitlists</h3>
                                <p className="text-neutral-500 text-xs mt-1">Notify customers automatically when out-of-stock items become available</p>
                            </div>
                            <button
                                onClick={() => setWaitlistModalOpen(true)}
                                className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] text-xs font-medium flex items-center gap-1.5 self-start transition-all"
                            >
                                <UserPlus size={14} /> Add Subscriber Manually
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex gap-3 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search by subscriber email, phone, or product..." 
                                    value={searchWaitlist}
                                    onChange={(e) => setSearchWaitlist(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadWaitlist()}
                                    className="w-full pl-9 pr-4 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                />
                            </div>
                            <button 
                                onClick={loadWaitlist}
                                className="bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border-[0.5px] border-black/10 px-4 py-2 rounded-[10px] text-xs font-medium transition-all"
                            >
                                Search
                            </button>
                        </div>

                        {/* Waitlist table */}
                        <div className="border-[0.5px] border-black/10 rounded-[10px] overflow-hidden">
                            <table className="min-w-full divide-y divide-black/10">
                                <thead className="bg-neutral-50">
                                    <tr className="border-b-[0.5px] border-black/10">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Product ID & Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Subscriber Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Date Registered</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-black/10">
                                    {waitlist.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-neutral-500 text-xs font-normal">
                                                No active restock waitlist signups found.
                                            </td>
                                        </tr>
                                    ) : (
                                        waitlist.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-neutral-50/40 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-xs">
                                                            <p className="font-medium text-neutral-900">{sub.product?.name || 'Unknown Product'}</p>
                                                            <p className="text-[10px] text-neutral-450 font-mono">ID: {sub.product_id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs">
                                                        <p className="font-medium text-neutral-800">{sub.email}</p>
                                                        <p className="text-neutral-500">{sub.phone || '(No phone number)'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500">
                                                    {new Date(sub.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-[10px] border-[0.5px] ${
                                                        sub.notified 
                                                            ? 'bg-green-50 text-green-700 border-black/50' 
                                                            : 'bg-neutral-50 text-neutral-700 border-black/10'
                                                    }`}>
                                                        {sub.notified ? 'Notified' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                                                    {!sub.notified && (
                                                        <button 
                                                            onClick={() => handleNotifyRestock(sub.product_id)}
                                                            className="text-neutral-800 hover:text-black font-medium hover:underline"
                                                        >
                                                            Trigger Restock Alert
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleRemoveWaitlist(sub.id)}
                                                        className="text-red-500 hover:text-red-700 font-semibold"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {waitlistTotalPages > 1 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-neutral-500">Page {waitlistPage} of {waitlistTotalPages}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setWaitlistPage(p => Math.max(1, p - 1))}
                                        disabled={waitlistPage === 1}
                                        className="px-3 py-1 bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 rounded-[10px] disabled:opacity-50 text-neutral-700 font-medium transition-all"
                                    >
                                        Prev
                                    </button>
                                    <button 
                                        onClick={() => setWaitlistPage(p => Math.min(waitlistTotalPages, p + 1))}
                                        disabled={waitlistPage === waitlistTotalPages}
                                        className="px-3 py-1 bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 rounded-[10px] disabled:opacity-50 text-neutral-700 font-medium transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. WHATSAPP API CONFIG */}
                {activeTab === 'whatsapp' && (
                    <div className="space-y-6">
                        <div className="border-b-[0.5px] border-black/10 pb-3 flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-neutral-900 text-base">WhatsApp API (AISensy Campaign Provider)</h3>
                                <p className="text-neutral-500 text-xs mt-1">Configure credentials for automated AISensy campaigns and test connection</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-neutral-600">
                                    {whatsappSettings.whatsapp_enabled === '1' ? 'Active' : 'Deactivated'}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setWhatsappSettings({
                                        ...whatsappSettings,
                                        whatsapp_enabled: whatsappSettings.whatsapp_enabled === '1' ? '0' : '1'
                                    })}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-[0.5px] border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        whatsappSettings.whatsapp_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                            whatsappSettings.whatsapp_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-1">WhatsApp Campaign Provider</label>
                                    <select 
                                        value={whatsappSettings.whatsapp_provider}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_provider: e.target.value })}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-white focus:border-black transition-colors"
                                    >
                                        <option value="aisensy">AISensy Business Cloud API</option>
                                        <option value="meta_cloud" disabled>Meta WhatsApp Cloud API (Direct)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-1">AISensy Developer API Key</label>
                                    <input 
                                        type="password" 
                                        placeholder="Enter AISensy apiKey string (or enter 'simulate' for dry-run logger)" 
                                        value={whatsappSettings.whatsapp_aisensy_api_key}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_aisensy_api_key: e.target.value })}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/10 outline-none font-mono focus:border-black transition-colors"
                                    />
                                    <p className="text-[10px] text-neutral-450 mt-1">Found in AISensy Dashboard under Campaign / API integration page.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-1">Default Sender Phone Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="+919999999999" 
                                        value={whatsappSettings.whatsapp_sender_number}
                                        onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsapp_sender_number: e.target.value })}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/10 outline-none focus:border-black transition-colors"
                                    />
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        onClick={handleSaveWhatsappSettings}
                                        disabled={saving}
                                        className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-all"
                                    >
                                        <Save size={14} /> Save API Settings
                                    </button>
                                    <button
                                        onClick={handleTestWhatsAppPing}
                                        disabled={pingStatus === 'testing'}
                                        className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-[0.5px] border-black/10 px-4 py-2 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-all"
                                    >
                                        {pingStatus === 'testing' && <RefreshCw size={14} className="animate-spin" />}
                                        Test API Status
                                    </button>
                                </div>
                            </div>

                            {/* Status Card Panel */}
                            <div className="bg-neutral-50/50 border-[0.5px] border-black/10 rounded-[10px] p-5 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-xs text-neutral-500">Integration Connection Status</h4>
                                    
                                    {pingStatus === 'idle' && (
                                        <div className="p-3 bg-neutral-50 border-[0.5px] border-black/10 text-neutral-650 rounded-[10px] text-xs font-medium flex items-center gap-2">
                                            <HelpCircle size={16} /> Enter credentials and click Test to verify ping connection.
                                        </div>
                                    )}
                                    {pingStatus === 'testing' && (
                                        <div className="p-3 bg-neutral-50 border-[0.5px] border-black/10 text-neutral-650 rounded-[10px] text-xs font-medium flex items-center gap-2 animate-pulse">
                                            <RefreshCw size={16} className="animate-spin" /> Querying AISensy single campaign webhook dispatcher...
                                        </div>
                                    )}
                                    {pingStatus === 'success' && (
                                        <div className="p-3 bg-green-50 border-[0.5px] border-black/50 text-green-700 rounded-[10px] text-xs font-medium flex items-center gap-2">
                                            <CheckCircle size={16} /> API Connected! AISensy Developer Token is authenticated successfully.
                                        </div>
                                    )}
                                    {pingStatus === 'failed' && (
                                        <div className="p-3 bg-red-50 border-[0.5px] border-black/50 text-red-700 rounded-[10px] text-xs font-medium flex items-center gap-2">
                                            <AlertCircle size={16} /> API Key check failed. Please check your token string parameters.
                                        </div>
                                    )}
                                </div>

                                <div className="border-t-[0.5px] border-black/10 pt-4 mt-4 text-xs text-neutral-500 space-y-2">
                                    <p className="font-medium text-neutral-700">Webhook Integration Callback (for delivery statuses):</p>
                                    <div className="p-2 bg-white rounded border-[0.5px] border-black/10 font-mono text-[10px] break-all select-all">
                                        {config('app.url', 'http://localhost:8000')}/api/payments/webhook
                                    </div>
                                    <p className="text-[10px] text-neutral-450">Configure this URL in AISensy webhook panel to receive Delivery Reports and Opt-out status updates.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-[0.5px] border-black/10 pb-3">
                            <div>
                                <h3 className="font-semibold text-neutral-900 text-base">Delivery Logs Audit Trail</h3>
                                <p className="text-neutral-500 text-xs mt-1">Audit log of all email and whatsapp messages dispatched by the system</p>
                            </div>
                            <button
                                onClick={handleClearLogs}
                                className="bg-red-50 border-[0.5px] border-black/50 hover:bg-red-100 text-red-650 px-4 py-2 rounded-[10px] text-xs font-medium flex items-center gap-1.5 self-start transition-all"
                            >
                                <Trash2 size={14} /> Flush All Logs
                            </button>
                        </div>

                        {/* Logs search and filter controls */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search by email, phone, name..." 
                                    value={searchLog}
                                    onChange={(e) => setSearchLog(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
                                    className="w-full pl-9 pr-4 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                />
                            </div>
                            <button 
                                onClick={loadLogs}
                                className="bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border-[0.5px] border-black/10 px-4 py-2 rounded-[10px] text-xs font-medium transition-all"
                            >
                                Search
                            </button>
                        </div>

                        {/* Logs table */}
                        <div className="border-[0.5px] border-black/10 rounded-[10px] overflow-hidden">
                            <table className="min-w-full divide-y divide-black/10">
                                <thead className="bg-neutral-50">
                                    <tr className="border-b-[0.5px] border-black/10">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Recipient Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Template Code / Flow</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Channel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500">Sent Time</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-black/10">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-10 text-center text-neutral-500 text-xs font-normal">
                                                No delivery log history found.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-neutral-50/40 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-900">
                                                    {log.recipient_name || 'Customer'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-600">
                                                    {log.channel === 'email' ? log.recipient_email : log.recipient_phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs">
                                                        <p className="font-medium text-neutral-800">{log.template_code}</p>
                                                        <p className="text-[10px] text-neutral-450 font-mono tracking-wider font-normal">{log.flow}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-[10px] border-[0.5px] border-black/10 bg-neutral-50 text-neutral-700">
                                                        {log.channel === 'email' ? 'Email' : 'WhatsApp'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-[10px] border-[0.5px] ${
                                                        log.status === 'sent' 
                                                            ? 'bg-green-50 text-green-700 border-black/50' 
                                                            : log.status === 'failed'
                                                            ? 'bg-red-50 text-red-700 border-black/50'
                                                            : 'bg-neutral-50 text-neutral-700 border-black/10'
                                                    }`}>
                                                        {log.status === 'sent' ? 'Sent' : log.status === 'failed' ? 'Failed' : 'Queued'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                                                    <button 
                                                        onClick={() => setLogDetailsModal(log)}
                                                        className="text-neutral-800 hover:text-black hover:underline font-semibold flex items-center gap-1 ml-auto"
                                                    >
                                                        <Eye size={12} /> View Content
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logTotalPages > 1 && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-neutral-500">Page {logPage} of {logTotalPages}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setLogPage(p => Math.max(1, p - 1))}
                                        disabled={logPage === 1}
                                        className="px-3 py-1 bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 rounded-[10px] disabled:opacity-50 text-neutral-750 font-medium transition-all"
                                    >
                                        Prev
                                    </button>
                                    <button 
                                        onClick={() => setLogPage(p => Math.min(logTotalPages, p + 1))}
                                        disabled={logPage === logTotalPages}
                                        className="px-3 py-1 bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 rounded-[10px] disabled:opacity-50 text-neutral-750 font-medium transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. SYSTEM DOCUMENTATION GUIDE TAB */}
                {activeTab === 'guide' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="border-b-[0.5px] border-black/10 pb-3">
                            <h3 className="font-semibold text-neutral-900 text-base">System Documentation & Help Guide</h3>
                            <p className="text-neutral-500 text-xs mt-1">Full operational manual for SMTP emails and AISensy WhatsApp campaigns</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Col: Core Architecture & Flows */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-neutral-50 border-[0.5px] border-black/10 rounded-[10px] p-5 space-y-3">
                                    <h4 className="font-medium text-neutral-800 text-sm">1. Introduction to the Engine</h4>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        The Cureza Notification Engine automates both transaction-critical triggers (like order confirmation and fulfillment tracking updates) and customer engagement retention campaigns (like cart recovery alerts, restock waitlists, and review prompts).
                                    </p>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Each flow category compiles template variables dynamically using direct data mapping. The transport defaults to high-quality SMTP formats for Email and AISensy Cloud campaigns for WhatsApp.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-neutral-800 text-sm border-b-[0.5px] pb-1">2. Customer Lifecycle Flows Details</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white border-[0.5px] border-black/10 rounded-[10px] p-4 space-y-2">
                                            <span className="font-medium text-xs text-neutral-900 block">📦 Order Tracking Flow</span>
                                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                                Event-driven transactional notifications triggered immediately upon checkout events: Confirmed, Handed to courier (shipped), and Delivered. These bypass marketing opt-out blocks.
                                            </p>
                                        </div>
                                        <div className="bg-white border-[0.5px] border-black/10 rounded-[10px] p-4 space-y-2">
                                            <span className="font-medium text-xs text-neutral-900 block">🛒 Abandoned Cart Recovery</span>
                                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                                Delay-driven alerts evaluating active carts. Step 1 dispatches after 1 hour. Step 2 dispatches after 24 hours, automatically attaching an exclusive 10% coupon code (CUREZA10).
                                            </p>
                                        </div>
                                        <div className="bg-white border-[0.5px] border-black/10 rounded-[10px] p-4 space-y-2">
                                            <span className="font-medium text-xs text-neutral-900 block">🔔 Restock Waitlist</span>
                                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                                Allows guest and logged-in users to register for out-of-stock items. Once stock updates, a restock campaign is dispatched automatically (or manually via the Waitlist tab).
                                            </p>
                                        </div>
                                        <div className="bg-white border-[0.5px] border-black/10 rounded-[10px] p-4 space-y-2">
                                            <span className="font-medium text-xs text-neutral-900 block">⏰ Feedback & Replenishments</span>
                                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                                                Review prompts go out 3 days post-delivery. Subscription consumable alerts go out after 30 days to remind members to replenish their supply.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-neutral-50/50 border-[0.5px] border-black/10 rounded-[10px] p-5">
                                    <h4 className="font-medium text-neutral-800 text-sm">3. AISensy API Integration Schema</h4>
                                    <p className="text-xs text-neutral-550 leading-relaxed">
                                        AISensy requires positional parameter arrays for text replacements (e.g. <code>templateParams</code>: <code>["Rahul", "CZ120"]</code>). The system automates this by reading the variables schema array mapped inside each WhatsApp template.
                                    </p>
                                    <p className="text-xs text-neutral-550 leading-relaxed">
                                        To integrate templates, configure your Meta Developer settings inside the **AISensy API Configuration** tab and map the templates by campaign name. Set status to "Approved" to enable sync.
                                    </p>
                                </div>
                            </div>

                            {/* Right Col: Code Snippets & Variables */}
                            <div className="space-y-6">
                                <div className="border-[0.5px] border-black/10 bg-white rounded-[10px] p-5 space-y-4">
                                    <h4 className="font-medium text-xs text-neutral-500">Template Variables Dictionary</h4>
                                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto border-[0.5px] border-black/10 rounded-[10px]">
                                        <table className="min-w-full divide-y divide-black/10 text-[11px] font-sans">
                                            <thead className="bg-neutral-50">
                                                <tr className="border-b-[0.5px] border-black/10">
                                                    <th className="px-3 py-2 text-left font-medium text-neutral-500">Variable</th>
                                                    <th className="px-3 py-2 text-left font-medium text-neutral-500">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-black/5">
                                                {[
                                                    { v: 'customer_name', d: 'Display name of recipient' },
                                                    { v: 'order_id', d: 'Unique sequential order key' },
                                                    { v: 'order_amount', d: 'Total checkout final cost' },
                                                    { v: 'payment_status', d: 'Fulfillment payment state' },
                                                    { v: 'carrier', d: 'Courier partner (BlueDart, Delhivery)' },
                                                    { v: 'tracking_number', d: 'Courier tracking code / AWB' },
                                                    { v: 'est_delivery_date', d: 'Expected delivery timestamp' },
                                                    { v: 'tracking_link', d: 'Direct AWB tracking portal URL' },
                                                    { v: 'review_link', d: 'Review creation panel link' },
                                                    { v: 'cart_link', d: 'Active cart checkout recovery link' },
                                                    { v: 'product_name', d: 'Associated catalog item name' },
                                                    { v: 'product_link', d: 'Direct catalog detail URL link' },
                                                    { v: 'unsubscribe_link', d: 'Email subscription opt-out link' }
                                                ].map(item => (
                                                    <tr key={item.v} className="hover:bg-neutral-50/40">
                                                        <td className="px-3 py-2 font-mono font-medium text-neutral-800 bg-neutral-50/50 border-r-[0.5px] border-black/5">{`{{${item.v}}}`}</td>
                                                        <td className="px-3 py-2 text-neutral-500 font-normal">{item.d}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="border-[0.5px] border-black/10 bg-white rounded-[10px] p-5 space-y-3">
                                    <h4 className="font-medium text-xs text-neutral-500">Cron Job Command Console</h4>
                                    <p className="text-[11px] text-neutral-500">
                                        Trigger evaluation scripts via console shells.
                                    </p>
                                    <div className="p-3 bg-neutral-900 text-neutral-200 font-mono text-[10px] rounded-[10px] break-all select-all border-[0.5px] border-black">
                                        php artisan notifications:process-flows
                                    </div>
                                </div>

                                <div className="border-[0.5px] border-black/10 bg-white rounded-[10px] p-5 space-y-2 text-xs">
                                    <h4 className="font-medium text-xs text-neutral-500">Preference Opt-Outs</h4>
                                    <p className="text-neutral-500 leading-relaxed text-[11px]">
                                        When a user ticks the unsubscribed preference (equivalent to setting column <code>users.unsubscribed_marketing = 1</code> in DB), the system bypasses marketing dispatches but continues delivery notifications.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* EDIT TEMPLATE MODAL */}
            {editorOpen && selectedTemplate && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[10px] border-[0.5px] border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-neutral-50 px-6 py-4 border-b-[0.5px] border-black/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-neutral-900 text-base">
                                    {selectedTemplate.id ? 'Edit Template' : 'Create New Notification Template'}
                                </h3>
                                <p className="text-xs text-neutral-500 mt-1 font-normal">Configure layout copy parameters and automated schedule delays</p>
                            </div>
                            <button 
                                onClick={() => setEditorOpen(false)}
                                className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-[10px] hover:bg-neutral-50 border-[0.5px] border-transparent hover:border-black/5 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Sandbox body */}
                        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Left Side: Fields Editor */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Friendly Name</label>
                                        <input 
                                            type="text" 
                                            value={selectedTemplate.name}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Unique Code identifier</label>
                                        <input 
                                            type="text" 
                                            value={selectedTemplate.code}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                                            placeholder="e.g. order_confirmed"
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none font-mono focus:border-black transition-colors"
                                            disabled={!!selectedTemplate.id}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Target Flow Category</label>
                                        <select 
                                            value={selectedTemplate.flow}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, flow: e.target.value as any })}
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-white focus:border-black transition-colors"
                                        >
                                            <option value="order">Order Transactional Flow</option>
                                            <option value="abandoned_cart">Abandoned Cart Flow</option>
                                            <option value="restock">Product Restock Flow</option>
                                            <option value="reminder">Reminder & Feedback Flow</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Delivery Channel</label>
                                        <select 
                                            value={selectedTemplate.channel}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, channel: e.target.value as any, subject: e.target.value === 'whatsapp' ? '' : selectedTemplate.subject })}
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-white focus:border-black transition-colors"
                                        >
                                            <option value="email">Email</option>
                                            <option value="whatsapp">WhatsApp Campaign (AISensy)</option>
                                        </select>
                                    </div>
                                </div>

                                {selectedTemplate.channel === 'email' ? (
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Email Subject Line</label>
                                        <input 
                                            type="text" 
                                            value={selectedTemplate.subject || ''}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                                            placeholder="Enter mail subject template..."
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-700 mb-1">AISensy Campaign Name</label>
                                            <input 
                                                type="text" 
                                                value={selectedTemplate.whatsapp_template_name || ''}
                                                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, whatsapp_template_name: e.target.value })}
                                                placeholder="e.g. order_shipped_v1"
                                                className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none font-mono focus:border-black transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-neutral-700 mb-1">Approval Status</label>
                                            <select 
                                                value={selectedTemplate.whatsapp_status}
                                                onChange={(e) => setSelectedTemplate({ ...selectedTemplate, whatsapp_status: e.target.value as any })}
                                                className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-white focus:border-black transition-colors"
                                            >
                                                <option value="approved">Approved (Meta sync active)</option>
                                                <option value="pending">Pending Meta Approval</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3 border-t-[0.5px] border-black/10 pt-3">
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Trigger Type</label>
                                        <select 
                                            value={selectedTemplate.trigger_type}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, trigger_type: e.target.value as any })}
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-white focus:border-black transition-colors"
                                        >
                                            <option value="event">Event-driven</option>
                                            <option value="delay">Delay Interval</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Delay Value</label>
                                        <input 
                                            type="number" 
                                            value={selectedTemplate.delay_value}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, delay_value: parseInt(e.target.value) || 0 })}
                                            disabled={selectedTemplate.trigger_type === 'event'}
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-neutral-50/20 focus:border-black transition-colors disabled:bg-neutral-100 disabled:text-neutral-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-neutral-700 mb-1">Delay Unit</label>
                                        <select 
                                            value={selectedTemplate.delay_unit}
                                            onChange={(e) => setSelectedTemplate({ ...selectedTemplate, delay_unit: e.target.value as any })}
                                            disabled={selectedTemplate.trigger_type === 'event'}
                                            className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-white focus:border-black transition-colors disabled:bg-neutral-100 disabled:text-neutral-400"
                                        >
                                            <option value="hours">Hour(s)</option>
                                            <option value="days">Day(s)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t-[0.5px] border-black/10 pt-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-xs font-medium text-neutral-700">Body Copy Template</label>
                                        <span className="text-[10px] text-neutral-400">Click chips to insert placeholders</span>
                                    </div>
                                    
                                    {/* Placeholders Variable helper chips */}
                                    <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-neutral-50 border-[0.5px] border-black/10 rounded-[10px] max-h-[80px] overflow-y-auto">
                                        {[
                                            'customer_name', 'order_id', 'order_amount', 'payment_status', 
                                            'carrier', 'tracking_number', 'est_delivery_date', 'tracking_link', 
                                            'review_link', 'cart_link', 'product_name', 'product_link', 'unsubscribe_link'
                                        ].map((placeholder) => (
                                            <button
                                                key={placeholder}
                                                type="button"
                                                onClick={() => handleInsertPlaceholder(placeholder)}
                                                className="bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 text-neutral-700 text-[10px] px-1.5 py-0.5 rounded-[10px] font-mono font-medium transition-colors"
                                            >
                                                {placeholder}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea 
                                        ref={textareaRef}
                                        rows={10}
                                        value={selectedTemplate.content}
                                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, content: e.target.value })}
                                        className="w-full p-3 border-[0.5px] border-black/10 rounded-[10px] text-xs font-mono bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                        placeholder={selectedTemplate.channel === 'email' ? 'Enter HTML body context...' : 'Enter WhatsApp message text...'}
                                    />
                                </div>
                            </div>

                            {/* Right Side: Tabbed Preview */}
                            <div className="lg:border-l-[0.5px] lg:border-black/10 lg:pl-6 space-y-4">
                                <div className="flex border-b-[0.5px] border-black/10">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('edit')}
                                        className={`px-4 py-2 text-xs font-medium border-b-[0.5px] transition-all ${
                                            previewMode === 'edit' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-900'
                                        }`}
                                    >
                                        Guidelines & Variables
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('preview')}
                                        className={`px-4 py-2 text-xs font-medium border-b-[0.5px] transition-all ${
                                            previewMode === 'preview' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-900'
                                        }`}
                                    >
                                        Live Compilation Preview
                                    </button>
                                </div>

                                {previewMode === 'edit' ? (
                                    <div className="space-y-4 text-xs text-neutral-600 bg-neutral-50 p-5 rounded-[10px] border-[0.5px] border-black/10 h-full overflow-y-auto">
                                        <h4 className="font-medium text-neutral-850">Template Instructions</h4>
                                        <ul className="list-disc pl-4 space-y-2 text-neutral-500 font-normal">
                                            <li>Use standard curly brackets tags <code className="bg-white px-1.5 py-0.5 border-[0.5px] border-black/10 rounded font-mono font-medium text-red-650">{"{{variable_name}}"}</code> to print dynamic database columns.</li>
                                            <li>For **WhatsApp Campaign**, ensure you map variables in the exact sequence in the copy. AISensy API accepts positional parameters in sequence.</li>
                                            <li>For **Emails**, you can use full inline styling HTML tags (e.g. table structures, inline CSS wrappers). Standard layout header and footer are seeded automatically.</li>
                                            <li>Marketing/Reminder flows automatically check customer preferences and won't send if users request to opt-out.</li>
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="h-full">
                                        {getLivePreview(selectedTemplate)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-neutral-50 px-6 py-4 border-t-[0.5px] border-black/10 flex justify-between items-center">
                            <div>
                                {selectedTemplate.id !== 0 && (
                                    <button 
                                        type="button"
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this template registry?')) {
                                                await api.delete(`/admin/notifications/templates/${selectedTemplate.id}`);
                                                setEditorOpen(false);
                                                loadTemplates();
                                                loadStats();
                                            }
                                        }}
                                        className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                        <Trash2 size={14} /> Delete Template
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setEditorOpen(false)}
                                    className="bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleSaveTemplate(selectedTemplate)}
                                    disabled={saving}
                                    className="bg-black hover:bg-neutral-900 text-white px-4 py-2 border-[0.5px] border-black/15 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    {saving && <RefreshCw size={12} className="animate-spin" />}
                                    Save Template
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEND TEST MODAL */}
            {testModalOpen && selectedTemplate && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[10px] border-[0.5px] border-black/10 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b-[0.5px] border-black/10 flex justify-between items-center">
                            <h3 className="font-semibold text-neutral-900 text-sm">
                                Test Dispatch Campaign
                            </h3>
                            <button onClick={() => setTestModalOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-neutral-500 font-normal">
                                Provide a test destination to evaluate compiler placeholders and dispatch rules.
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Recipient Name</label>
                                <input 
                                    type="text" 
                                    value={testRecipient.name}
                                    onChange={(e) => setTestRecipient({ ...testRecipient, name: e.target.value })}
                                    className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                />
                            </div>
                            {selectedTemplate.channel === 'email' ? (
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-1">Destination Email</label>
                                    <input 
                                        type="email" 
                                        value={testRecipient.email}
                                        onChange={(e) => setTestRecipient({ ...testRecipient, email: e.target.value })}
                                        placeholder="test@example.com"
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-neutral-700 mb-1">Destination Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={testRecipient.phone}
                                        onChange={(e) => setTestRecipient({ ...testRecipient, phone: e.target.value })}
                                        placeholder="919999999999 (include country code)"
                                        className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="bg-neutral-50 px-6 py-4 border-t-[0.5px] border-black/10 flex justify-end gap-3">
                            <button 
                                onClick={() => setTestModalOpen(false)}
                                className="bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendTest}
                                disabled={saving}
                                className="bg-black hover:bg-neutral-900 text-white px-4 py-2 border-[0.5px] border-black/15 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                                {saving && <RefreshCw size={12} className="animate-spin" />}
                                Send Test Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AUDIT LOG DETAILS MODAL */}
            {logDetailsModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[10px] border-[0.5px] border-black/10 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="bg-neutral-50 px-6 py-4 border-b-[0.5px] border-black/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-neutral-900 text-sm">
                                    Dispatched Message Payload
                                </h3>
                                <p className="text-xs text-neutral-500 mt-1 font-normal">Log ID: {logDetailsModal.id} | Sent on {new Date(logDetailsModal.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setLogDetailsModal(null)} className="text-neutral-400 hover:text-neutral-900">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/10">
                                <div>
                                    <p className="text-neutral-500 font-medium">Recipient</p>
                                    <p className="font-medium text-neutral-900 mt-0.5">{logDetailsModal.recipient_name || 'Customer'}</p>
                                    <p className="text-neutral-500 font-mono text-[11px] mt-0.5">{logDetailsModal.channel === 'email' ? logDetailsModal.recipient_email : logDetailsModal.recipient_phone}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-500 font-medium">Template / Flow</p>
                                    <p className="font-medium text-neutral-900 mt-0.5">{logDetailsModal.template_code}</p>
                                    <p className="text-green-600 font-mono text-[10px] mt-0.5">{logDetailsModal.flow}</p>
                                </div>
                            </div>

                            {logDetailsModal.error_message && (
                                <div className="p-3 bg-red-50 border-[0.5px] border-black/50 text-red-700 rounded-[10px] text-xs font-medium flex items-center gap-2">
                                    <AlertCircle className="text-red-500" size={16} />
                                    Error Details: {logDetailsModal.error_message}
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-medium text-neutral-500 mb-2">Rendered Content Output</p>
                                {logDetailsModal.channel === 'email' ? (
                                    <div className="border-[0.5px] border-black/10 rounded-[10px] overflow-hidden">
                                        <div className="bg-neutral-50 px-4 py-1.5 border-b-[0.5px] border-black/10 text-xs font-medium text-neutral-800">
                                            Subject: {logDetailsModal.subject || '(No Subject Line)'}
                                        </div>
                                        <iframe 
                                            srcDoc={logDetailsModal.content} 
                                            title="Sent Email Content" 
                                            className="w-full min-h-[300px] border-0"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-neutral-50 p-5 rounded-[10px] border-[0.5px] border-black/10 font-sans">
                                        <div className="max-w-[85%] bg-white rounded-[10px] border-[0.5px] border-black/10 p-3 text-xs text-neutral-800 whitespace-pre-line leading-relaxed">
                                            {logDetailsModal.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-neutral-50 px-6 py-4 border-t-[0.5px] border-black/10 flex justify-end">
                            <button 
                                onClick={() => setLogDetailsModal(null)}
                                className="bg-black hover:bg-neutral-900 text-white px-5 py-2 border-[0.5px] border-black/15 rounded-[10px] text-xs font-medium transition-colors"
                            >
                                Close Log
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MANUAL WAITLIST SUBSCRIBER MODAL */}
            {waitlistModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[10px] border-[0.5px] border-black/10 overflow-hidden">
                        <div className="bg-neutral-50 px-6 py-4 border-b-[0.5px] border-black/10 flex justify-between items-center">
                            <h3 className="font-semibold text-neutral-900 text-sm">
                                Add Restock Waitlist Entry
                            </h3>
                            <button onClick={() => setWaitlistModalOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Target Product</label>
                                <select 
                                    value={newWaitlistEntry.product_id}
                                    onChange={(e) => setNewWaitlistEntry({ ...newWaitlistEntry, product_id: e.target.value })}
                                    className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs outline-none bg-white focus:border-black transition-colors"
                                >
                                    <option value="">-- Choose Out of stock product --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Email</label>
                                <input 
                                    type="email" 
                                    value={newWaitlistEntry.email}
                                    onChange={(e) => setNewWaitlistEntry({ ...newWaitlistEntry, email: e.target.value })}
                                    placeholder="customer@example.com"
                                    className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1">Customer Phone (WhatsApp)</label>
                                <input 
                                    type="text" 
                                    value={newWaitlistEntry.phone}
                                    onChange={(e) => setNewWaitlistEntry({ ...newWaitlistEntry, phone: e.target.value })}
                                    placeholder="e.g. 919999999999"
                                    className="w-full px-3 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs bg-neutral-50/20 outline-none focus:border-black transition-colors"
                                />
                            </div>
                        </div>
                        <div className="bg-neutral-50 px-6 py-4 border-t-[0.5px] border-black/10 flex justify-end gap-3">
                            <button 
                                onClick={() => setWaitlistModalOpen(false)}
                                className="bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddWaitlist}
                                disabled={saving || !newWaitlistEntry.product_id || !newWaitlistEntry.email}
                                className="bg-black hover:bg-neutral-900 text-white px-4 py-2 border-[0.5px] border-black/15 rounded-[10px] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                                {saving && <RefreshCw size={12} className="animate-spin" />}
                                Add Subscriber
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminNotificationSettingsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col justify-center items-center py-20 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-[0.5px] border-cureza-green"></div>
                <span className="text-sm text-gray-500 font-medium">Loading page configurations...</span>
            </div>
        }>
            <NotificationSettingsContent />
        </Suspense>
    );
}

// Quick helper to read settings mock value in node configs
function config(key: string, fallback: string): string {
    return fallback;
}
