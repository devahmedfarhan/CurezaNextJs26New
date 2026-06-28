'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Mail, Settings, Key, FileText, Users, Megaphone, 
    Clock, Activity, CheckCircle2, AlertTriangle, Trash2, 
    Upload, Download, Plus, X, ChevronRight, Loader2, 
    RefreshCw, Play, Eye, HelpCircle, Sliders, Database, Search
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import api from '@/lib/api';

interface SmtpProvider {
    id: number;
    provider_name: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    encryption: string;
    sender_name: string;
    sender_email: string;
    reply_to?: string;
    timeout: number;
    retry_count: number;
    max_emails_per_hour: number;
    max_emails_per_day: number;
    is_active: boolean;
    is_backup: boolean;
    priority: number;
    notes?: string;
}

interface EmailTemplate {
    id: number;
    key: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    is_active: boolean;
    theme: string;
}

interface Subscriber {
    id: number;
    email: string;
    name?: string;
    status: string;
    tags?: string[];
    segments?: string[];
    created_at: string;
}

interface Campaign {
    id: number;
    title: string;
    subject: string;
    segment: string;
    template: string;
    status: string;
    recipients: number;
    delivered: number;
    open_rate: number;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_failed: number;
    sent_at?: string;
}

interface EmailLog {
    id: number;
    recipient: string;
    subject: string;
    template_key?: string;
    status: string;
    retry_count: number;
    smtp_used?: string;
    created_at: string;
    sent_at?: string;
    error_details?: string;
    response?: string;
}

export default function CommunicationCenterPage() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('analytics');

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Dynamic Lists States
    const [smtpList, setSmtpList] = useState<SmtpProvider[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [analytics, setAnalytics] = useState<any>({
        sent: 0, queued: 0, delivered: 0, failed: 0, subscribers: 0,
        campaigns: 0, smtp_health: 'Loading...', open_rate: 0, click_rate: 0, bounce_rate: 0, spam_rate: 0
    });
    const [queueData, setQueueData] = useState({ pending_jobs: 0, failed_jobs: 0, queue_connection: 'database' });

    // Modals & Editors states
    const [smtpModalOpen, setSmtpModalOpen] = useState(false);
    const [selectedSmtp, setSelectedSmtp] = useState<SmtpProvider | null>(null);
    const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
    const [testEmailSmtpId, setTestEmailSmtpId] = useState<number | null>(null);
    const [testEmailRecipient, setTestEmailRecipient] = useState('');
    const [connectionValidating, setConnectionValidating] = useState(false);

    // Template Modal state
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

    // Subscriber Modal state
    const [subModalOpen, setSubModalOpen] = useState(false);
    const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);

    // Campaign Modal state
    const [campaignModalOpen, setCampaignModalOpen] = useState(false);

    // Details Modal state (Logs Error)
    const [logDetailsModalOpen, setLogDetailsModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

    // Filters & Pagination
    const [logSearch, setLogSearch] = useState('');
    const [logStatusFilter, setLogStatusFilter] = useState('');
    const [subSearch, setSubSearch] = useState('');
    const [subStatusFilter, setSubStatusFilter] = useState('');

    // CSV File Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Formats
    const [smtpForm, setSmtpForm] = useState({
        provider_name: '', host: '', port: 465, username: '', password: '',
        encryption: 'ssl', sender_name: 'Cureza Wellness', sender_email: 'admin@cureza.com',
        reply_to: 'support@cureza.com', timeout: 30, retry_count: 3,
        max_emails_per_hour: 100, max_emails_per_day: 1000,
        is_active: false, is_backup: false, priority: 1, notes: ''
    });

    const [templateForm, setTemplateForm] = useState({
        key: '', name: '', subject: '', body: '', theme: 'light', variables: [] as string[]
    });

    const [subForm, setSubForm] = useState({
        email: '', name: '', status: 'subscribed', tags: [] as string[], segments: [] as string[]
    });

    const [campaignForm, setCampaignForm] = useState({
        title: '', subject: '', segment: 'all', template: 'Weekly Newsletter', body: ''
    });

    // Custom CSS card wrapper to enforce user rules
    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
        backgroundColor: '#ffffff'
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [resAnal, resSmtp, resTempl, resSubs, resCamp, resLogs, resQueue] = await Promise.all([
                api.get('/admin/communication/analytics'),
                api.get('/admin/communication/smtp'),
                api.get('/admin/communication/templates'),
                api.get('/admin/communication/subscribers'),
                api.get('/admin/campaigns'),
                api.get('/admin/communication/logs'),
                api.get('/admin/communication/queue')
            ]);
            setAnalytics(resAnal.data);
            setSmtpList(resSmtp.data);
            setTemplates(resTempl.data);
            setSubscribers(resSubs.data.data || resSubs.data);
            setCampaigns(resCamp.data);
            setLogs(resLogs.data.data || resLogs.data);
            setQueueData(resQueue.data);
        } catch (error) {
            console.error('Failed to load Communication Center data:', error);
            showToast('Failed to fetch configurations from server.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [activeTab]);

    // Polling active campaigns progress
    useEffect(() => {
        const hasSending = campaigns.some(c => c.status === 'queued' || c.status === 'sending');
        if (!hasSending) return;

        const interval = setInterval(async () => {
            try {
                const res = await api.get('/admin/campaigns');
                setCampaigns(res.data);
            } catch (err) {
                console.error(err);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [campaigns]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    // SMTP Operations
    const openSmtpModal = (provider: SmtpProvider | null = null) => {
        if (provider) {
            setSelectedSmtp(provider);
            setSmtpForm({
                provider_name: provider.provider_name,
                host: provider.host,
                port: provider.port,
                username: provider.username,
                password: '********', // masked
                encryption: provider.encryption,
                sender_name: provider.sender_name,
                sender_email: provider.sender_email,
                reply_to: provider.reply_to || '',
                timeout: provider.timeout,
                retry_count: provider.retry_count,
                max_emails_per_hour: provider.max_emails_per_hour,
                max_emails_per_day: provider.max_emails_per_day,
                is_active: provider.is_active,
                is_backup: provider.is_backup,
                priority: provider.priority,
                notes: provider.notes || ''
            });
        } else {
            setSelectedSmtp(null);
            setSmtpForm({
                provider_name: '', host: '', port: 465, username: '', password: '',
                encryption: 'ssl', sender_name: 'Cureza Wellness', sender_email: 'admin@cureza.com',
                reply_to: 'support@cureza.com', timeout: 30, retry_count: 3,
                max_emails_per_hour: 100, max_emails_per_day: 1000,
                is_active: false, is_backup: false, priority: 1, notes: ''
            });
        }
        setSmtpModalOpen(true);
    };

    const handleSaveSmtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            if (selectedSmtp) {
                await api.put(`/admin/communication/smtp/${selectedSmtp.id}`, smtpForm);
                showToast('SMTP Provider configuration updated successfully.', 'success');
            } else {
                await api.post('/admin/communication/smtp', smtpForm);
                showToast('SMTP Provider configuration created and verified.', 'success');
            }
            setSmtpModalOpen(false);
            fetchAllData();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.error_details || error.response?.data?.message || 'SMTP Validation and Auth Failed.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTestSmtpConnection = async () => {
        setConnectionValidating(true);
        try {
            const res = await api.post('/admin/communication/smtp/test-connection', {
                host: smtpForm.host,
                port: smtpForm.port,
                username: smtpForm.username,
                password: smtpForm.password,
                encryption: smtpForm.encryption
            });
            if (res.data.success) {
                showToast('SMTP Connected successfully! Credentials verified.', 'success');
            } else {
                showToast('SMTP Connection failed.', 'error');
            }
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Validation failed: Outgoing socket rejected.', 'error');
        } finally {
            setConnectionValidating(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmailRecipient) return showToast('Please enter recipient email.', 'error');
        setActionLoading(true);
        try {
            await api.post(`/admin/communication/smtp/${testEmailSmtpId}/test-email`, {
                recipient: testEmailRecipient
            });
            showToast(`SMTP Connected. Test email dispatched to ${testEmailRecipient}`, 'success');
            setTestEmailModalOpen(false);
            setTestEmailRecipient('');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'SMTP Failed. Sending verification email failed.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteSmtp = async (id: number) => {
        if (!confirm('Are you sure you want to delete this SMTP provider?')) return;
        try {
            await api.delete(`/admin/communication/smtp/${id}`);
            showToast('SMTP Provider deleted successfully.', 'success');
            fetchAllData();
        } catch (error) {
            showToast('Failed to delete SMTP configuration.', 'error');
        }
    };

    // Template Operations
    const openTemplateModal = (template: EmailTemplate | null = null) => {
        if (template) {
            setSelectedTemplate(template);
            setTemplateForm({
                key: template.key,
                name: template.name,
                subject: template.subject,
                body: template.body,
                theme: template.theme,
                variables: template.variables || []
            });
        } else {
            setSelectedTemplate(null);
            setTemplateForm({
                key: '', name: '', subject: '', body: '', theme: 'light', variables: []
            });
        }
        setTemplateModalOpen(true);
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            if (selectedTemplate) {
                await api.put(`/admin/communication/templates/${selectedTemplate.id}`, templateForm);
                showToast('Email Template updated successfully.', 'success');
            } else {
                await api.post('/admin/communication/templates', templateForm);
                showToast('Email Template created successfully.', 'success');
            }
            setTemplateModalOpen(false);
            fetchAllData();
        } catch (error) {
            showToast('Failed to save email template.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await api.delete(`/admin/communication/templates/${id}`);
            showToast('Email Template deleted successfully.', 'success');
            fetchAllData();
        } catch (error) {
            showToast('Failed to delete email template.', 'error');
        }
    };

    // Subscriber Operations
    const handleSaveSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            if (selectedSubscriber) {
                await api.put(`/admin/communication/subscribers/${selectedSubscriber.id}`, subForm);
                showToast('Subscriber updated successfully.', 'success');
            } else {
                await api.post('/admin/communication/subscribers', subForm);
                showToast('Subscriber added successfully.', 'success');
            }
            setSubModalOpen(false);
            fetchAllData();
        } catch (error) {
            showToast('Failed to save subscriber.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openSubModal = (subscriber: Subscriber | null = null) => {
        if (subscriber) {
            setSelectedSubscriber(subscriber);
            setSubForm({
                email: subscriber.email,
                name: subscriber.name || '',
                status: subscriber.status,
                tags: subscriber.tags || [],
                segments: subscriber.segments || []
            });
        } else {
            setSelectedSubscriber(null);
            setSubForm({
                email: '', name: '', status: 'subscribed', tags: [], segments: []
            });
        }
        setSubModalOpen(true);
    };

    const handleDeleteSubscriber = async (id: number) => {
        if (!confirm('Are you sure you want to delete this subscriber?')) return;
        try {
            await api.delete(`/admin/communication/subscribers/${id}`);
            showToast('Subscriber deleted successfully.', 'success');
            fetchAllData();
        } catch (error) {
            showToast('Failed to delete subscriber.', 'error');
        }
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setActionLoading(true);
        try {
            const res = await api.post('/admin/communication/subscribers/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast(`CSV Processed successfully. Imported: ${res.data.imported}, Failed: ${res.data.failed}`, 'success');
            fetchAllData();
        } catch (error) {
            showToast('Failed to import CSV subscribers file.', 'error');
        } finally {
            setActionLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleExportCSV = () => {
        window.open(`${api.defaults.baseURL}/admin/communication/subscribers/export`, '_blank');
        showToast('Subscribers CSV exported successfully.', 'success');
    };

    // Campaign Operations
    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/admin/campaigns', {
                title: campaignForm.title,
                subject: campaignForm.subject,
                segment: campaignForm.segment,
                template: campaignForm.template
            });
            showToast('Marketing campaign scheduled and dispatched.', 'success');
            setCampaignModalOpen(false);
            setCampaignForm({ title: '', subject: '', segment: 'all', template: 'Weekly Newsletter', body: '' });
            fetchAllData();
        } catch (error) {
            showToast('Failed to dispatch campaign.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Queue Operations
    const handleClearFailedQueue = async () => {
        if (!confirm('Are you sure you want to delete all failed queue jobs?')) return;
        setActionLoading(true);
        try {
            await api.post('/admin/communication/queue/clear-failed');
            showToast('Failed jobs queue truncated.', 'success');
            fetchAllData();
        } catch (error) {
            showToast('Failed to clear queue.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Helper: badge status coloring
    const getStatusBadge = (status: string) => {
        const nStatus = status.toLowerCase();
        if (nStatus === 'sent' || nStatus === 'subscribed' || nStatus === 'delivered') {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">Active / {status}</span>;
        } else if (nStatus === 'failed' || nStatus === 'unsubscribed') {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">{status}</span>;
        } else {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">{status}</span>;
        }
    };

    return (
        <div className="w-full space-y-6 pb-20 font-sans text-neutral-900 container mx-auto px-4 md:px-6">
            
            {/* Header section with forest green theme */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-[0.5px] border-black/10 pb-5">
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 tracking-tight" style={{ color: '#052326' }}>Communication Center</h1>
                    <p className="text-neutral-500 text-xs mt-0.5">Centralized SMTP dispatchers, dynamic email templates, queue auditing, and automated campaigns.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchAllData}
                        disabled={loading}
                        className="p-2 border border-black/10 hover:bg-neutral-50 rounded-lg text-neutral-600 transition-all shrink-0 bg-white"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {activeTab === 'smtp' && (
                        <button 
                            onClick={() => openSmtpModal()}
                            className="bg-black hover:bg-neutral-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0"
                            style={{ backgroundColor: '#052326' }}
                        >
                            <Plus size={14} /> Add Provider
                        </button>
                    )}
                    {activeTab === 'templates' && (
                        <button 
                            onClick={() => openTemplateModal()}
                            className="bg-black hover:bg-neutral-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0"
                            style={{ backgroundColor: '#052326' }}
                        >
                            <Plus size={14} /> Create Template
                        </button>
                    )}
                    {activeTab === 'newsletter' && (
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImportCSV} 
                                className="hidden" 
                                accept=".csv,text/csv"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-black/10 hover:bg-neutral-50 text-neutral-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 bg-white"
                            >
                                <Upload size={14} /> Import CSV
                            </button>
                            <button 
                                onClick={handleExportCSV}
                                className="border border-black/10 hover:bg-neutral-50 text-neutral-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0 bg-white"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                            <button 
                                onClick={() => openSubModal()}
                                className="bg-black hover:bg-neutral-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0"
                                style={{ backgroundColor: '#052326' }}
                            >
                                <Plus size={14} /> Add Subscriber
                            </button>
                        </div>
                    )}
                    {activeTab === 'campaigns' && (
                        <button 
                            onClick={() => setCampaignModalOpen(true)}
                            className="bg-black hover:bg-neutral-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all text-xs shrink-0"
                            style={{ backgroundColor: '#052326' }}
                        >
                            <Plus size={14} /> Create Campaign
                        </button>
                    )}
                </div>
            </div>

            {/* Premium Pill Tabs */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-neutral-100 overflow-x-auto no-scrollbar">
                {[
                    { id: 'analytics', label: 'Analytics Dashboard', icon: Activity },
                    { id: 'smtp', label: 'SMTP Providers', icon: Key },
                    { id: 'templates', label: 'Email Templates', icon: FileText },
                    { id: 'newsletter', label: 'Subscribers List', icon: Users },
                    { id: 'campaigns', label: 'Marketing Campaigns', icon: Megaphone },
                    { id: 'logs', label: 'Outbound Logs', icon: Mail },
                    { id: 'queue', label: 'Queue Manager', icon: Clock },
                    { id: 'settings', label: 'System Setup', icon: Settings }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap border ${
                                isActive 
                                    ? 'border-neutral-900 text-white bg-neutral-900 font-semibold' 
                                    : 'border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 bg-white'
                            }`}
                            style={isActive ? { backgroundColor: '#052326', borderColor: '#052326' } : {}}
                        >
                            <Icon size={13} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENTS */}
            {loading ? (
                <div className="w-full flex flex-col justify-center items-center py-24 space-y-4">
                    <Loader2 className="animate-spin text-neutral-800" size={32} style={{ color: '#052326' }} />
                    <p className="text-xs text-neutral-500 font-normal animate-pulse">Syncing communication modules...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    
                    {/* 1. ANALYTICS DASHBOARD */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* Counter Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Outbound Emails Sent', value: analytics.sent, desc: 'Successful dispatches', icon: CheckCircle2, color: 'text-green-600' },
                                    { label: 'Active Queue Count', value: analytics.queued, desc: 'Scheduled / pending sending', icon: Clock, color: 'text-amber-500' },
                                    { label: 'Delivery Log Failure', value: analytics.failed, desc: 'Bounces & failed socket retries', icon: AlertTriangle, color: 'text-red-600' },
                                    { label: 'Newsletter Subscribers', value: analytics.subscribers, desc: 'Verified opt-in accounts', icon: Users, color: 'text-neutral-700' }
                                ].map((stat, i) => (
                                    <div key={i} style={cardStyle} className="p-4 flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">{stat.label}</span>
                                            <stat.icon size={16} className={stat.color} />
                                        </div>
                                        <div className="mt-2">
                                            <span className="text-2xl font-semibold tracking-tight text-neutral-900">{stat.value}</span>
                                            <p className="text-[10px] text-neutral-400 mt-0.5">{stat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Rates Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Open Rate', value: `${analytics.open_rate}%`, desc: 'Image pixel download rate' },
                                    { label: 'Click Rate', value: `${analytics.click_rate}%`, desc: 'Campaign URL redirect click rate' },
                                    { label: 'Bounce Rate', value: `${analytics.bounce_rate}%`, desc: 'Failed deliveries' },
                                    { label: 'SMTP Connection Health', value: analytics.smtp_health, desc: 'Primary Hostinger socket state' }
                                ].map((rate, i) => (
                                    <div key={i} style={cardStyle} className="p-4 bg-neutral-50/50">
                                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">{rate.label}</span>
                                        <div className="mt-1">
                                            <span className="text-lg font-medium text-neutral-900">{rate.value}</span>
                                            <p className="text-[10px] text-neutral-400 mt-0.5">{rate.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Extra visual analytics card */}
                            <div style={cardStyle} className="p-6">
                                <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">SMTP Delivery Success Rate</h3>
                                <div className="h-6 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                                    <div 
                                        style={{ width: `${analytics.sent + analytics.failed > 0 ? (analytics.sent / (analytics.sent + analytics.failed)) * 100 : 100}%` }} 
                                        className="bg-green-600 h-full flex items-center justify-center text-[9px] text-white font-semibold"
                                    >
                                        {analytics.sent + analytics.failed > 0 ? round((analytics.sent / (analytics.sent + analytics.failed)) * 100, 1) : 100}% Success
                                    </div>
                                    <div 
                                        style={{ width: `${analytics.sent + analytics.failed > 0 ? (analytics.failed / (analytics.sent + analytics.failed)) * 100 : 0}%` }} 
                                        className="bg-red-500 h-full"
                                    ></div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-500">
                                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-600 inline-block"></span> Successful SMTP dispatches</span>
                                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span> Rejected connection sockets</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. SMTP PROVIDERS */}
                    {activeTab === 'smtp' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                {smtpList.map((smtp) => (
                                    <div key={smtp.id} style={cardStyle} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-semibold text-neutral-900">{smtp.provider_name}</h3>
                                                {smtp.is_active && (
                                                    <span className="bg-green-50 text-green-700 border border-green-200 text-[9px] px-2 py-0.5 rounded-full font-bold">PRIMARY ACTIVE</span>
                                                )}
                                                {smtp.is_backup && (
                                                    <span className="bg-neutral-100 text-neutral-700 border border-neutral-300 text-[9px] px-2 py-0.5 rounded-full font-bold">FAILOVER BACKUP</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-500">Host: <b>{smtp.host}:{smtp.port}</b> | Encryption: <b>{smtp.encryption.toUpperCase()}</b> | Sender: <b>{smtp.sender_name} ({smtp.sender_email})</b></p>
                                            {smtp.notes && <p className="text-[10px] text-neutral-400 italic">Notes: {smtp.notes}</p>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button 
                                                onClick={() => { setTestEmailSmtpId(smtp.id); setTestEmailModalOpen(true); }}
                                                className="border border-black/10 hover:bg-neutral-50 text-neutral-700 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white"
                                            >
                                                Send Test
                                            </button>
                                            <button 
                                                onClick={() => openSmtpModal(smtp)}
                                                className="border border-black/10 hover:bg-neutral-50 text-neutral-700 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white"
                                            >
                                                Configure
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteSmtp(smtp.id)}
                                                className="border border-red-200 text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {smtpList.length === 0 && (
                                    <div className="text-center py-12 text-neutral-500 text-xs">
                                        No SMTP providers configured. Click "Add Provider" to set up your Hostinger SMTP server.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. EMAIL TEMPLATES */}
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((template) => (
                                <div key={template.id} style={cardStyle} className="p-5 flex flex-col justify-between space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-semibold text-neutral-900">{template.name}</h3>
                                            <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border">
                                                {template.key}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500">Subject: <b>{template.subject}</b></p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {template.variables?.map((v, i) => (
                                                <span key={i} className="text-[9px] font-mono bg-neutral-50 text-neutral-400 px-1.5 py-0.5 rounded border border-black/5">
                                                    {"{{" + v + "}}"}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
                                        <span className="text-[10px] text-neutral-400 uppercase font-semibold">Theme: {template.theme}</span>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => openTemplateModal(template)}
                                                className="border border-black/10 hover:bg-neutral-50 text-neutral-700 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                className="border border-red-100 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {templates.length === 0 && (
                                <div className="col-span-2 text-center py-12 text-neutral-500 text-xs">
                                    No email templates stored in database.
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. NEWSLETTER & SUBSCRIBERS */}
                    {activeTab === 'newsletter' && (
                        <div className="space-y-4">
                            {/* Filter Bar */}
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type="text"
                                        placeholder="Search subscribers..."
                                        value={subSearch}
                                        onChange={(e) => setSubSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select
                                        value={subStatusFilter}
                                        onChange={(e) => setSubStatusFilter(e.target.value)}
                                        className="border border-neutral-200 rounded-lg py-1.5 px-3 text-xs bg-white focus:outline-none"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="subscribed">Subscribed</option>
                                        <option value="pending">Pending Opt-In</option>
                                        <option value="unsubscribed">Unsubscribed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div style={cardStyle} className="overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold">
                                            <th className="p-3">Subscriber Email</th>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Opt-in Status</th>
                                            <th className="p-3">Tags</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers
                                            .filter(sub => {
                                                const matchesSearch = sub.email.toLowerCase().includes(subSearch.toLowerCase()) || 
                                                    (sub.name && sub.name.toLowerCase().includes(subSearch.toLowerCase()));
                                                const matchesStatus = subStatusFilter ? sub.status === subStatusFilter : true;
                                                return matchesSearch && matchesStatus;
                                            })
                                            .map((sub) => (
                                                <tr key={sub.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                                                    <td className="p-3 font-semibold text-neutral-900">{sub.email}</td>
                                                    <td className="p-3 text-neutral-600">{sub.name || '-'}</td>
                                                    <td className="p-3">{getStatusBadge(sub.status)}</td>
                                                    <td className="p-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {sub.tags?.map((t, i) => (
                                                                <span key={i} className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right space-x-1">
                                                        <button 
                                                            onClick={() => openSubModal(sub)}
                                                            className="text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 font-semibold"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteSubscriber(sub.id)}
                                                            className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 font-semibold"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                        {subscribers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-neutral-500">
                                                    No subscribers found in database.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 5. MARKETING CAMPAIGNS */}
                    {activeTab === 'campaigns' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                {campaigns.map((camp) => (
                                    <div key={camp.id} style={cardStyle} className="p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold text-neutral-900">{camp.title}</h3>
                                                    {getStatusBadge(camp.status)}
                                                </div>
                                                <p className="text-xs text-neutral-500 mt-1">Subject: <b>{camp.subject}</b> | Target Segment: <b>{camp.segment}</b> | Template: <b>{camp.template}</b></p>
                                            </div>
                                            {camp.sent_at && (
                                                <span className="text-[10px] text-neutral-400">Sent: {new Date(camp.sent_at).toLocaleString()}</span>
                                            )}
                                        </div>

                                        {/* Progress Bar for sending */}
                                        {(camp.status === 'sending' || camp.status === 'queued') && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-neutral-400">
                                                    <span>Sending emails ({camp.delivered}% completed)</span>
                                                    <span>{camp.total_sent} of {camp.recipients} dispatched</span>
                                                </div>
                                                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                                                    <div style={{ width: `${camp.delivered}%`, backgroundColor: '#052326' }} className="bg-neutral-950 h-full transition-all duration-300"></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Metrics display for sent campaigns */}
                                        {camp.status === 'sent' && (
                                            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-neutral-100 text-center">
                                                <div>
                                                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Recipients</span>
                                                    <p className="text-sm font-semibold text-neutral-900 mt-0.5">{camp.recipients}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Open Rate</span>
                                                    <p className="text-sm font-semibold text-neutral-900 mt-0.5">{camp.open_rate}%</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Click Count</span>
                                                    <p className="text-sm font-semibold text-neutral-900 mt-0.5">{camp.total_clicked}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-neutral-400 uppercase font-semibold">Delivered</span>
                                                    <p className="text-sm font-semibold text-neutral-900 mt-0.5">{camp.total_sent}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {campaigns.length === 0 && (
                                    <div className="text-center py-12 text-neutral-500 text-xs">
                                        No campaigns dispatched yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 6. OUTBOUND LOGS */}
                    {activeTab === 'logs' && (
                        <div className="space-y-4">
                            {/* Log filters */}
                            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type="text"
                                        placeholder="Search logs by recipient or subject..."
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-neutral-950"
                                    />
                                </div>
                                <select
                                    value={logStatusFilter}
                                    onChange={(e) => setLogStatusFilter(e.target.value)}
                                    className="border border-neutral-200 rounded-lg py-1.5 px-3 text-xs bg-white focus:outline-none w-full sm:w-auto"
                                >
                                    <option value="">All Logs</option>
                                    <option value="sent">Sent</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="queued">Queued</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            {/* Logs list */}
                            <div style={cardStyle} className="overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold">
                                            <th className="p-3">Recipient</th>
                                            <th className="p-3">Subject</th>
                                            <th className="p-3">Template</th>
                                            <th className="p-3">SMTP Provider</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3 text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs
                                            .filter(log => {
                                                const matchesSearch = log.recipient.toLowerCase().includes(logSearch.toLowerCase()) || 
                                                    log.subject.toLowerCase().includes(logSearch.toLowerCase());
                                                const matchesStatus = logStatusFilter ? log.status === logStatusFilter : true;
                                                return matchesSearch && matchesStatus;
                                            })
                                            .map((log) => (
                                                <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                                                    <td className="p-3 font-semibold text-neutral-900">{log.recipient}</td>
                                                    <td className="p-3 text-neutral-600 max-w-xs truncate">{log.subject}</td>
                                                    <td className="p-3 text-neutral-400 font-mono text-[10px]">{log.template_key || 'Raw HTML'}</td>
                                                    <td className="p-3 text-neutral-500 font-mono text-[10px]">{log.smtp_used || 'Log Driver'}</td>
                                                    <td className="p-3">{getStatusBadge(log.status)}</td>
                                                    <td className="p-3 text-neutral-400 text-[10px]">{new Date(log.created_at).toLocaleString()}</td>
                                                    <td className="p-3 text-right">
                                                        <button 
                                                            onClick={() => { setSelectedLog(log); setLogDetailsModalOpen(true); }}
                                                            className="text-neutral-500 hover:text-neutral-950 font-semibold"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                        {logs.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-8 text-neutral-500">
                                                    No delivery logs available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 7. QUEUE MANAGER */}
                    {activeTab === 'queue' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div style={cardStyle} className="p-6">
                                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Queue Monitor</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs py-2 border-b border-neutral-100">
                                            <span className="text-neutral-500">Queue Connection Driver</span>
                                            <span className="font-semibold text-neutral-900 uppercase">{queueData.queue_connection}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-2 border-b border-neutral-100">
                                            <span className="text-neutral-500">Active Pending Jobs</span>
                                            <span className="font-semibold text-amber-600">{queueData.pending_jobs}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-2 border-b border-neutral-100">
                                            <span className="text-neutral-500">Failed / Permanent Error Jobs</span>
                                            <span className="font-semibold text-red-600">{queueData.failed_jobs}</span>
                                        </div>
                                    </div>
                                    {queueData.failed_jobs > 0 && (
                                        <button 
                                            onClick={handleClearFailedQueue}
                                            disabled={actionLoading}
                                            className="mt-6 w-full border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-medium bg-white transition-all"
                                        >
                                            Clear Failed Jobs
                                        </button>
                                    )}
                                </div>

                                <div style={cardStyle} className="p-6 space-y-4">
                                    <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Queue Backoff Guidelines</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        All platform outbound emails are queued automatically to prevent blocking user requests. When SMTP socket issues occur, jobs will trigger retries under a backoff algorithm:
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-neutral-50 p-2.5 rounded border border-black/5">
                                            <span className="text-[10px] text-neutral-400 font-semibold uppercase">Retry 1</span>
                                            <p className="text-xs font-semibold text-neutral-800 mt-0.5">1 Minute</p>
                                        </div>
                                        <div className="bg-neutral-50 p-2.5 rounded border border-black/5">
                                            <span className="text-[10px] text-neutral-400 font-semibold uppercase">Retry 2</span>
                                            <p className="text-xs font-semibold text-neutral-800 mt-0.5">5 Minutes</p>
                                        </div>
                                        <div className="bg-neutral-50 p-2.5 rounded border border-black/5">
                                            <span className="text-[10px] text-neutral-400 font-semibold uppercase">Retry 3</span>
                                            <p className="text-xs font-semibold text-neutral-800 mt-0.5">15 Minutes</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 italic">
                                        If all 3 retries fail, emails are moved into the failed queue and audited in the Outbound Logs registry.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 8. SYSTEM SETUP (SETTINGS) */}
                    {activeTab === 'settings' && (
                        <div style={cardStyle} className="p-6 max-w-2xl space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-900">Communication Defaults</h3>
                                <p className="text-xs text-neutral-400 mt-0.5">Control double opt-in settings, pixel tracking, and email routing definitions.</p>
                            </div>
                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                                    <div>
                                        <span className="font-semibold text-neutral-800">Double Opt-In Verification</span>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">Send a verification email to new subscribers before adding them to lists.</p>
                                    </div>
                                    <span className="px-3 py-1 font-semibold bg-green-50 text-green-700 border border-green-200 rounded text-[10px]">ENABLED</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                                    <div>
                                        <span className="font-semibold text-neutral-800">Tracking Pixel Integration</span>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">Appends transparent 1x1 image tracker to read email open analytics.</p>
                                    </div>
                                    <span className="px-3 py-1 font-semibold bg-green-50 text-green-700 border border-green-200 rounded text-[10px]">ENABLED</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                                    <div>
                                        <span className="font-semibold text-neutral-800">Central Service Lockout (`Mail::send` protection)</span>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">Prevents core code modules from calling direct Laravel Mail class bypasses.</p>
                                    </div>
                                    <span className="px-3 py-1 font-semibold bg-green-50 text-green-700 border border-green-200 rounded text-[10px]">ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* MODALS */}
            
            {/* 1. SMTP Provider Modal */}
            {smtpModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6" style={{ borderRadius: '8px' }}>
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <h2 className="text-sm font-semibold text-neutral-900">{selectedSmtp ? 'Modify SMTP Configuration' : 'Add SMTP Provider'}</h2>
                            <button onClick={() => setSmtpModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Provider Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={smtpForm.provider_name} 
                                        onChange={(e) => setSmtpForm({...smtpForm, provider_name: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                        placeholder="e.g. Hostinger SMTP"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">SMTP Host</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={smtpForm.host} 
                                        onChange={(e) => setSmtpForm({...smtpForm, host: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                        placeholder="smtp.hostinger.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">SMTP Port</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={smtpForm.port} 
                                        onChange={(e) => setSmtpForm({...smtpForm, port: parseInt(e.target.value)})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                        placeholder="465"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Encryption</label>
                                    <select 
                                        value={smtpForm.encryption} 
                                        onChange={(e) => setSmtpForm({...smtpForm, encryption: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs bg-white"
                                    >
                                        <option value="ssl">SSL (Port 465)</option>
                                        <option value="tls">TLS (Port 587)</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Timeout (sec)</label>
                                    <input 
                                        type="number" 
                                        value={smtpForm.timeout} 
                                        onChange={(e) => setSmtpForm({...smtpForm, timeout: parseInt(e.target.value)})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Username</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={smtpForm.username} 
                                        onChange={(e) => setSmtpForm({...smtpForm, username: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                        placeholder="admin@cureza.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={smtpForm.password} 
                                        onChange={(e) => setSmtpForm({...smtpForm, password: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                        placeholder="SMTP Secret"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Sender Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={smtpForm.sender_name} 
                                        onChange={(e) => setSmtpForm({...smtpForm, sender_name: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Sender Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={smtpForm.sender_email} 
                                        onChange={(e) => setSmtpForm({...smtpForm, sender_email: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Reply-To</label>
                                    <input 
                                        type="email" 
                                        value={smtpForm.reply_to} 
                                        onChange={(e) => setSmtpForm({...smtpForm, reply_to: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 py-2">
                                    <input 
                                        type="checkbox" 
                                        id="is_active" 
                                        checked={smtpForm.is_active} 
                                        onChange={(e) => setSmtpForm({...smtpForm, is_active: e.target.checked})} 
                                        className="rounded border-neutral-300"
                                    />
                                    <label htmlFor="is_active" className="font-medium text-neutral-600">Mark as primary SMTP</label>
                                </div>
                                <div className="flex items-center gap-2 py-2">
                                    <input 
                                        type="checkbox" 
                                        id="is_backup" 
                                        checked={smtpForm.is_backup} 
                                        onChange={(e) => setSmtpForm({...smtpForm, is_backup: e.target.checked})} 
                                        className="rounded border-neutral-300"
                                    />
                                    <label htmlFor="is_backup" className="font-medium text-neutral-600">Use as failover backup</label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Admin Notes</label>
                                <textarea 
                                    value={smtpForm.notes} 
                                    onChange={(e) => setSmtpForm({...smtpForm, notes: e.target.value})} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs h-16" 
                                    placeholder="SMTP comments, priority rules..."
                                />
                            </div>

                            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                <button 
                                    type="button" 
                                    onClick={handleTestSmtpConnection}
                                    disabled={connectionValidating}
                                    className="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all bg-white"
                                >
                                    {connectionValidating ? <Loader2 size={13} className="animate-spin" /> : null}
                                    Validate Credentials
                                </button>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setSmtpModalOpen(false)} className="border border-neutral-200 hover:bg-neutral-50 px-3 py-2 rounded-lg font-medium text-neutral-600">Cancel</button>
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading}
                                        className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-all"
                                        style={{ backgroundColor: '#052326' }}
                                    >
                                        {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                        Save SMTP
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Send Test Email Modal */}
            {testEmailModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm p-6 space-y-6" style={{ borderRadius: '8px' }}>
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <h2 className="text-sm font-semibold text-neutral-900">Send Test Email</h2>
                            <button onClick={() => setTestEmailModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                        </div>
                        <div className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Recipient Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={testEmailRecipient} 
                                    onChange={(e) => setTestEmailRecipient(e.target.value)} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                    placeholder="e.g. test@cureza.com"
                                />
                            </div>
                            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                                <button type="button" onClick={() => setTestEmailModalOpen(false)} className="border border-neutral-200 hover:bg-neutral-50 px-3 py-2 rounded-lg font-medium text-neutral-600">Cancel</button>
                                <button 
                                    type="button" 
                                    onClick={handleSendTestEmail}
                                    disabled={actionLoading}
                                    className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-all"
                                    style={{ backgroundColor: '#052326' }}
                                >
                                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                    Test Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Email Template Modal */}
            {templateModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6" style={{ borderRadius: '8px' }}>
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <h2 className="text-sm font-semibold text-neutral-900">{selectedTemplate ? 'Edit Template' : 'Create Email Template'}</h2>
                            <button onClick={() => setTemplateModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Template Key (unique)</label>
                                    <input 
                                        type="text" 
                                        required
                                        disabled={!!selectedTemplate}
                                        value={templateForm.key} 
                                        onChange={(e) => setTemplateForm({...templateForm, key: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs font-mono disabled:bg-neutral-50" 
                                        placeholder="e.g. auth.otp"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Template Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={templateForm.name} 
                                        onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                        placeholder="Login Verification OTP"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Email Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={templateForm.subject} 
                                        onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                        placeholder="Code: {{ $otp }}"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Design Layout Mode</label>
                                    <select 
                                        value={templateForm.theme} 
                                        onChange={(e) => setTemplateForm({...templateForm, theme: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs bg-white"
                                    >
                                        <option value="light">Light Theme (Soft Cream Background)</option>
                                        <option value="dark">Dark Theme (Forest Green Botanical)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Blade / HTML Body Content</label>
                                <textarea 
                                    required
                                    value={templateForm.body} 
                                    onChange={(e) => setTemplateForm({...templateForm, body: e.target.value})} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs font-mono h-48 focus:outline-none focus:ring-1 focus:ring-neutral-900" 
                                    placeholder="<h2 style='color:#052326'>Hello {{ $name }},</h2>..."
                                />
                                <p className="text-[10px] text-neutral-400">Supports standard HTML elements and raw Blade compilation e.g., <code>{"{{ $otp }}"}</code>, <code>{"{{ $name }}"}</code>. Will be automatically wrapped in dynamic Cureza email header, footer and logo frames.</p>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                                <button type="button" onClick={() => setTemplateModalOpen(false)} className="border border-neutral-200 hover:bg-neutral-50 px-3 py-2 rounded-lg font-medium text-neutral-600">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-all"
                                    style={{ backgroundColor: '#052326' }}
                                >
                                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                    Save Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 4. Subscriber Modal */}
            {subModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm p-6 space-y-6" style={{ borderRadius: '8px' }}>
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <h2 className="text-sm font-semibold text-neutral-900">{selectedSubscriber ? 'Edit Subscriber' : 'Add Subscriber'}</h2>
                            <button onClick={() => setSubModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSaveSubscriber} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    disabled={!!selectedSubscriber}
                                    value={subForm.email} 
                                    onChange={(e) => setSubForm({...subForm, email: e.target.value})} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs disabled:bg-neutral-50" 
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Name</label>
                                <input 
                                    type="text" 
                                    value={subForm.name} 
                                    onChange={(e) => setSubForm({...subForm, name: e.target.value})} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Opt-In Status</label>
                                <select 
                                    value={subForm.status} 
                                    onChange={(e) => setSubForm({...subForm, status: e.target.value})} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs bg-white"
                                >
                                    <option value="subscribed">Subscribed</option>
                                    <option value="pending">Pending opt-in</option>
                                    <option value="unsubscribed">Unsubscribed</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                                <button type="button" onClick={() => setSubModalOpen(false)} className="border border-neutral-200 hover:bg-neutral-50 px-3 py-2 rounded-lg font-medium text-neutral-600">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-all"
                                    style={{ backgroundColor: '#052326' }}
                                >
                                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 5. Campaign Modal */}
            {campaignModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md p-6 space-y-6" style={{ borderRadius: '8px' }}>
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <h2 className="text-sm font-semibold text-neutral-900">Dispatch Marketing Campaign</h2>
                            <button onClick={() => setCampaignModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Campaign Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={campaignForm.title} 
                                    onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                    placeholder="e.g. Summer Solstice Launch"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-neutral-500">Email Subject Line</label>
                                <input 
                                    type="text" 
                                    required
                                    value={campaignForm.subject} 
                                    onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})} 
                                    className="w-full p-2 border border-neutral-200 rounded-lg text-xs" 
                                    placeholder="Introducing our new botanical blend! 🌿"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Target Segment</label>
                                    <select 
                                        value={campaignForm.segment} 
                                        onChange={(e) => setCampaignForm({...campaignForm, segment: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs bg-white"
                                    >
                                        <option value="all">All Subscribers</option>
                                        <option value="repeat">Repeat Buyers</option>
                                        <option value="inactive">Inactive Users (&gt;30 days)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-medium text-neutral-500">Template</label>
                                    <select 
                                        value={campaignForm.template} 
                                        onChange={(e) => setCampaignForm({...campaignForm, template: e.target.value})} 
                                        className="w-full p-2 border border-neutral-200 rounded-lg text-xs bg-white"
                                    >
                                        {templates.map((t) => (
                                            <option key={t.id} value={t.key}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
                                <button type="button" onClick={() => setCampaignModalOpen(false)} className="border border-neutral-200 hover:bg-neutral-50 px-3 py-2 rounded-lg font-medium text-neutral-600">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-all"
                                    style={{ backgroundColor: '#052326' }}
                                >
                                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                    Dispatch Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 6. Log Details Modal (Error details) */}
            {logDetailsModalOpen && selectedLog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg p-6 space-y-6" style={{ borderRadius: '8px' }}>
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <h2 className="text-sm font-semibold text-neutral-900">Email Log Audit Details</h2>
                            <button onClick={() => setLogDetailsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                        </div>
                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4 text-[11px]">
                                <div>
                                    <span className="text-neutral-400 font-semibold uppercase">Recipient</span>
                                    <p className="font-semibold text-neutral-800 mt-0.5">{selectedLog.recipient}</p>
                                </div>
                                <div>
                                    <span className="text-neutral-400 font-semibold uppercase">Subject</span>
                                    <p className="font-semibold text-neutral-800 mt-0.5">{selectedLog.subject}</p>
                                </div>
                                <div>
                                    <span className="text-neutral-400 font-semibold uppercase">Template Key</span>
                                    <p className="font-semibold text-neutral-800 font-mono mt-0.5">{selectedLog.template_key || 'Raw HTML'}</p>
                                </div>
                                <div>
                                    <span className="text-neutral-400 font-semibold uppercase">SMTP Server</span>
                                    <p className="font-semibold text-neutral-800 font-mono mt-0.5">{selectedLog.smtp_used || 'Log Driver'}</p>
                                </div>
                                <div>
                                    <span className="text-neutral-400 font-semibold uppercase">Attempts / Retries</span>
                                    <p className="font-semibold text-neutral-800 mt-0.5">{selectedLog.retry_count}</p>
                                </div>
                                <div>
                                    <span className="text-neutral-400 font-semibold uppercase">Sent Date</span>
                                    <p className="font-semibold text-neutral-800 mt-0.5">{selectedLog.sent_at ? new Date(selectedLog.sent_at).toLocaleString() : '-'}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-neutral-400 font-semibold uppercase text-[10px]">SMTP Response / Error Output</span>
                                <div className="p-3 bg-neutral-50 rounded border border-neutral-100 font-mono text-[10px] max-h-40 overflow-y-auto whitespace-pre-wrap text-neutral-700">
                                    {selectedLog.error_details || selectedLog.response || 'Success: Dispatched without warnings.'}
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-neutral-100 pt-4">
                                <button type="button" onClick={() => setLogDetailsModalOpen(false)} className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: '#052326' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// Simple round utility
function round(value: number, precision: number) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
