'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Send, Users, BarChart2, Plus, X, Eye, CheckCircle2, Inbox, ArrowRight, HelpCircle, Loader2, RefreshCw, Calendar, Filter, Sparkles, AlertCircle, Copy, Check, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import VisualCodeEditor from '@/components/admin/VisualCodeEditor';

interface Campaign {
    id: number;
    title: string;
    channel: 'email' | 'whatsapp';
    subject: string;
    segment: string;
    template: string;
    settings?: {
        type?: 'standard' | 'ab_test';
        rules?: Array<{ field: string; operator: string; value: string }>;
        throttle_rate?: string;
    };
    status: 'draft' | 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed';
    recipients: number;
    delivered: number;
    open_rate: number;
    scheduled_at?: string;
    sent_at?: string;
    created_at: string;
}

export default function BroadcastPage() {
    const { showToast } = useToast();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'wizard'>('list');
    const [isScheduled, setIsScheduled] = useState(false);
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>([]);

    // Tab selection
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'audience'>('campaigns');

    // Templates State
    const [dbTemplates, setDbTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
    const [templateFormData, setTemplateFormData] = useState({ key: '', name: '', subject: '', body: '', theme: 'light' });
    const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);

    // Audience Lists State
    const [tabCustomers, setTabCustomers] = useState<any[]>([]);
    const [loadingTabCustomers, setLoadingTabCustomers] = useState(false);
    const [tabCustomerSearch, setTabCustomerSearch] = useState('');
    const [tabCustomerPage, setTabCustomerPage] = useState(1);
    const [tabCustomerTotalPages, setTabCustomerTotalPages] = useState(1);
    const [tabCustomerTotalCount, setTabCustomerTotalCount] = useState(0);

    const [tabSubscribers, setTabSubscribers] = useState<any[]>([]);
    const [loadingTabSubscribers, setLoadingTabSubscribers] = useState(false);
    const [tabSubscriberSearch, setTabSubscriberSearch] = useState('');
    const [tabSubscriberPage, setTabSubscriberPage] = useState(1);
    const [tabSubscriberTotalPages, setTabSubscriberTotalPages] = useState(1);
    const [tabSubscriberTotalCount, setTabSubscriberTotalCount] = useState(0);

    // Audience Source selection
    const [audienceSource, setAudienceSource] = useState<'database' | 'csv' | null>(null);

    // Database subscribers list & pagination
    const [dbSubscribers, setDbSubscribers] = useState<any[]>([]);
    const [dbSearch, setDbSearch] = useState('');
    const [dbPage, setDbPage] = useState(1);
    const [dbTotalCount, setDbTotalCount] = useState(0);
    const [dbTotalPages, setDbTotalPages] = useState(1);
    const [loadingDbSubscribers, setLoadingDbSubscribers] = useState(false);
    const [selectedDbIds, setSelectedDbIds] = useState<number[]>([]);

    // CSV contacts parsing & selection
    const [csvContacts, setCsvContacts] = useState<Array<{ name: string; email: string; phone: string }>>([]);
    const [selectedCsvEmails, setSelectedCsvEmails] = useState<string[]>([]);
    const [csvPage, setCsvPage] = useState(1);
    const csvPageSize = 10;
    const csvTotalPages = Math.ceil(csvContacts.length / csvPageSize);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Wizard step state
    const [currentStep, setCurrentStep] = useState(1);

    // Form inputs
    const [formData, setFormData] = useState({
        title: '',
        type: 'standard' as 'standard' | 'ab_test',
        channel: 'email' as 'email',
        subject: '',
        preheader: '',
        segment: 'all',
        template: 'weekly',
        bodyText: '',
        scheduled_at: '',
        throttle_rate: 'immediate',
        rules: [] as Array<{ field: string; operator: string; value: string }>
    });

    const [isSending, setIsSending] = useState(false);
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    // New Subscriber Management State
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<any | null>(null);
    const [subFormData, setSubFormData] = useState({ email: '', name: '', status: 'subscribed', tags: '' });
    const [isSubmittingSub, setIsSubmittingSub] = useState(false);

    // Bulk Operations State
    const [selectedSubIds, setSelectedSubIds] = useState<number[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    // CSV Import Preview/Confirmation State
    const [isCsvConfirmOpen, setIsCsvConfirmOpen] = useState(false);
    const [csvImportContacts, setCsvImportContacts] = useState<any[]>([]);
    const [csvImportPage, setCsvImportPage] = useState(1);
    const [csvImportFile, setCsvImportFile] = useState<File | null>(null);
    const [csvImportTags, setCsvImportTags] = useState('');
    const [isImportingCsv, setIsImportingCsv] = useState(false);
    const subFileInputRef = useRef<HTMLInputElement>(null);

    const emailTemplates: any[] = [];

    const mergeTags = [
        { tag: '{{customer_name}}', label: 'Customer Name', desc: 'Ahmed Farhan' },
        { tag: '{{email}}', label: 'Email', desc: 'customer@email.com' },
        { tag: '{{cart_link}}', label: 'Cart recovery Link', desc: 'cureza.in/cart' },
        { tag: '{{product_name}}', label: 'Product Name', desc: 'Cureza Ashwagandha Max' },
        { tag: '{{product_link}}', label: 'Product shop Link', desc: 'cureza.in/ashwagandha' }
    ];

    const ruleFields = [
        { value: 'created_at', label: 'Registered Date' },
        { value: 'orders_count', label: 'Orders Count' },
        { value: 'total_spent', label: 'Total Spent (₹)' },
        { value: 'country', label: 'Country' },
        { value: 'tags', label: 'Customer Tag' },
        { value: 'status', label: 'Subscription Status' }
    ];

    const getOperatorsForField = (field: string) => {
        switch (field) {
            case 'created_at':
                return [
                    { value: 'between', label: 'Between Dates' },
                    { value: 'greater_than', label: 'After Date' },
                    { value: 'less_than', label: 'Before Date' }
                ];
            case 'total_spent':
            case 'orders_count':
                return [
                    { value: 'between', label: 'In Range' },
                    { value: 'greater_than', label: 'Greater Than' },
                    { value: 'less_than', label: 'Less Than' },
                    { value: 'equals', label: 'Equals' }
                ];
            case 'country':
                return [
                    { value: 'equals', label: 'Equals' },
                    { value: 'contains', label: 'Contains' }
                ];
            case 'tags':
                return [
                    { value: 'contains', label: 'Contains' }
                ];
            case 'status':
                return [
                    { value: 'equals', label: 'Equals' }
                ];
            default:
                return [
                    { value: 'equals', label: 'Equals' }
                ];
        }
    };

    const fetchCampaigns = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get('/admin/campaigns');
            setCampaigns(res.data || []);
            setSelectedCampaignIds([]);
        } catch (error) {
            console.error('Failed to fetch campaigns list:', error);
            showToast('Failed to load campaigns list', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const res = await api.get('/admin/communication/templates');
            setDbTemplates(res.data || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            showToast('Failed to load templates', 'error');
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleDeleteTemplate = async (id: number) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await api.delete(`/admin/communication/templates/${id}`);
            showToast('Template deleted successfully', 'success');
            fetchTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            showToast('Failed to delete template', 'error');
        }
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!templateFormData.name || !templateFormData.subject || !templateFormData.body) {
            return showToast('Please fill out all required fields', 'error');
        }
        setIsSubmittingTemplate(true);
        try {
            if (editingTemplate) {
                await api.put(`/admin/communication/templates/${editingTemplate.id}`, {
                    name: templateFormData.name,
                    subject: templateFormData.subject,
                    body: templateFormData.body,
                    theme: templateFormData.theme,
                    variables: []
                });
                showToast('Template updated successfully', 'success');
            } else {
                if (!templateFormData.key) {
                    return showToast('Key is required for new templates', 'error');
                }
                await api.post('/admin/communication/templates', {
                    key: templateFormData.key,
                    name: templateFormData.name,
                    subject: templateFormData.subject,
                    body: templateFormData.body,
                    theme: templateFormData.theme,
                    variables: []
                });
                showToast('Template created successfully', 'success');
            }
            setIsTemplateModalOpen(false);
            fetchTemplates();
        } catch (error: any) {
            console.error('Failed to save template:', error);
            showToast(error.response?.data?.message || 'Failed to save template', 'error');
        } finally {
            setIsSubmittingTemplate(false);
        }
    };

    const handleOpenTemplateModal = (template?: any) => {
        if (template) {
            setEditingTemplate(template);
            setTemplateFormData({
                key: template.key,
                name: template.name,
                subject: template.subject,
                body: template.body,
                theme: template.theme || 'light'
            });
        } else {
            setEditingTemplate(null);
            setTemplateFormData({
                key: '',
                name: '',
                subject: '',
                body: '',
                theme: 'light'
            });
        }
        setIsTemplateModalOpen(true);
    };

    const fetchTabCustomers = async (page = 1, search = '') => {
        setLoadingTabCustomers(true);
        try {
            const params: any = { page };
            if (search) params.search = search;
            const res = await api.get('/admin/customers', { params });
            if (res.data && res.data.data) {
                setTabCustomers(res.data.data);
                setTabCustomerPage(res.data.current_page || page);
                setTabCustomerTotalPages(res.data.last_page || 1);
                setTabCustomerTotalCount(res.data.total || 0);
            } else {
                setTabCustomers(Array.isArray(res.data) ? res.data : []);
                setTabCustomerTotalCount(Array.isArray(res.data) ? res.data.length : 0);
                setTabCustomerTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoadingTabCustomers(false);
        }
    };

    const fetchTabSubscribers = async (page = 1, search = '') => {
        setLoadingTabSubscribers(true);
        try {
            const res = await api.get(`/admin/communication/subscribers?page=${page}&search=${search}`);
            if (res.data && res.data.data) {
                setTabSubscribers(res.data.data);
                setTabSubscriberPage(res.data.current_page || page);
                setTabSubscriberTotalPages(res.data.last_page || 1);
                setTabSubscriberTotalCount(res.data.total || 0);
            } else if (Array.isArray(res.data)) {
                setTabSubscribers(res.data);
                setTabSubscriberTotalCount(res.data.length);
                setTabSubscriberTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
        } finally {
            setLoadingTabSubscribers(false);
        }
    };

    const openSubModal = (sub?: any) => {
        if (sub) {
            setEditingSub(sub);
            setSubFormData({
                email: sub.email,
                name: sub.name || '',
                status: sub.status || 'subscribed',
                tags: sub.tags ? (Array.isArray(sub.tags) ? sub.tags.join(', ') : String(sub.tags)) : ''
            });
        } else {
            setEditingSub(null);
            setSubFormData({
                email: '',
                name: '',
                status: 'subscribed',
                tags: ''
            });
        }
        setIsSubModalOpen(true);
    };

    const handleSaveSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subFormData.email) {
            return showToast('Email is required', 'error');
        }
        setIsSubmittingSub(true);
        try {
            const tagsArray = subFormData.tags ? subFormData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
            const payload = {
                name: subFormData.name || null,
                status: subFormData.status,
                tags: tagsArray,
                segments: editingSub?.segments || []
            };

            if (editingSub) {
                await api.put(`/admin/communication/subscribers/${editingSub.id}`, payload);
                showToast('Subscriber updated successfully', 'success');
            } else {
                await api.post('/admin/communication/subscribers', {
                    email: subFormData.email,
                    ...payload
                });
                showToast('Subscriber added successfully', 'success');
            }
            setIsSubModalOpen(false);
            setEditingSub(null);
            setSubFormData({ email: '', name: '', status: 'subscribed', tags: '' });
            fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch);
        } catch (error: any) {
            console.error('Failed to save subscriber:', error);
            const errorMsg = error.response?.data?.message || 'Failed to save subscriber';
            showToast(errorMsg, 'error');
        } finally {
            setIsSubmittingSub(false);
        }
    };

    const handleDeleteSubscriber = async (id: number) => {
        if (!confirm('Are you sure you want to delete this subscriber?')) return;
        try {
            await api.delete(`/admin/communication/subscribers/${id}`);
            showToast('Subscriber deleted successfully', 'success');
            fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch);
        } catch (error) {
            console.error('Failed to delete subscriber:', error);
            showToast('Failed to delete subscriber', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedSubIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete the ${selectedSubIds.length} selected subscriber(s)?`)) return;
        setIsBulkUpdating(true);
        try {
            await api.post('/admin/communication/subscribers/bulk-delete', { ids: selectedSubIds });
            showToast(`Successfully deleted ${selectedSubIds.length} subscriber(s)`, 'success');
            setSelectedSubIds([]);
            fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch);
        } catch (error) {
            console.error('Failed bulk delete:', error);
            showToast('Failed to delete selected subscribers', 'error');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkStatusUpdate = async (status: 'subscribed' | 'unsubscribed' | 'pending') => {
        if (selectedSubIds.length === 0) return;
        setIsBulkUpdating(true);
        try {
            await api.post('/admin/communication/subscribers/bulk-status', { ids: selectedSubIds, status });
            showToast(`Successfully marked selected subscribers as ${status}`, 'success');
            setSelectedSubIds([]);
            fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch);
        } catch (error) {
            console.error('Failed bulk status update:', error);
            showToast('Failed to update status', 'error');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const parseSubscribersCSV = (text: string) => {
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) return [];
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const tagsIdx = headers.findIndex(h => h.includes('tag') || h.includes('tags'));
        
        const contacts: any[] = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
            const email = row[emailIdx >= 0 ? emailIdx : 0] || '';
            const name = row[nameIdx >= 0 ? nameIdx : 1] || '';
            const tags = row[tagsIdx >= 0 ? tagsIdx : 2] || '';
            
            if (email && email.includes('@')) {
                contacts.push({ name, email, tags });
            }
        }
        return contacts;
    };

    const handleSubCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setCsvImportFile(file);
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            try {
                const parsed = parseSubscribersCSV(text);
                if (parsed.length === 0) {
                    showToast('No valid subscriber records found in CSV file', 'error');
                    return;
                }
                setCsvImportContacts(parsed);
                setCsvImportPage(1);
                setCsvImportTags('');
                setIsCsvConfirmOpen(true);
            } catch (err) {
                console.error('Failed to parse CSV:', err);
                showToast('Invalid CSV format', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleConfirmCsvImport = async () => {
        if (!csvImportFile) return;
        setIsImportingCsv(true);
        try {
            const formData = new FormData();
            formData.append('file', csvImportFile);
            
            const res = await api.post('/admin/communication/subscribers/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const imported = res.data?.imported || 0;
            const failed = res.data?.failed || 0;
            showToast(`Import completed: ${imported} imported, ${failed} failed.`, 'success');
            
            setIsCsvConfirmOpen(false);
            setCsvImportFile(null);
            setCsvImportContacts([]);
            fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch);
        } catch (error: any) {
            console.error('Failed CSV import:', error);
            showToast(error.response?.data?.message || 'Failed to import CSV subscribers', 'error');
        } finally {
            setIsImportingCsv(false);
        }
    };

    const isAllTabSelectedOnPage = () => {
        if (tabSubscribers.length === 0) return false;
        return tabSubscribers.every(sub => selectedSubIds.includes(sub.id));
    };

    const handleSelectAllTabOnPage = () => {
        const pageIds = tabSubscribers.map(sub => sub.id);
        if (isAllTabSelectedOnPage()) {
            setSelectedSubIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedSubIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleDeleteCampaign = async (id: number) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await api.delete(`/admin/campaigns/${id}`);
            showToast('Campaign deleted successfully', 'success');
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to delete campaign:', error);
            showToast('Failed to delete campaign', 'error');
        }
    };

    const handleDuplicateCampaign = async (id: number) => {
        if (!confirm('Are you sure you want to duplicate this campaign?')) return;
        try {
            await api.post(`/admin/campaigns/${id}/duplicate`);
            showToast('Campaign duplicated successfully and queued!', 'success');
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to duplicate campaign:', error);
            showToast('Failed to duplicate campaign', 'error');
        }
    };

    const handleBulkDeleteCampaigns = async () => {
        if (selectedCampaignIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete the ${selectedCampaignIds.length} selected campaigns?`)) return;
        try {
            await api.post('/admin/campaigns/bulk-delete', { ids: selectedCampaignIds });
            showToast('Campaigns deleted successfully', 'success');
            setSelectedCampaignIds([]);
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to bulk delete campaigns:', error);
            showToast('Failed to delete selected campaigns', 'error');
        }
    };

    useEffect(() => {
        fetchCampaigns();
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (activeTab === 'audience') {
            const timer = setTimeout(() => {
                fetchTabCustomers(tabCustomerPage, tabCustomerSearch);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, tabCustomerPage, tabCustomerSearch]);

    useEffect(() => {
        if (activeTab === 'audience') {
            const timer = setTimeout(() => {
                fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, tabSubscriberPage, tabSubscriberSearch]);

    // Polling effect while campaign is sending/queued
    useEffect(() => {
        const hasActiveCampaigns = campaigns.some(c => c.status === 'queued' || c.status === 'sending');
        if (!hasActiveCampaigns) return;

        const interval = setInterval(() => {
            fetchCampaigns(true);
        }, 3000);

        return () => clearInterval(interval);
    }, [campaigns]);

    const fetchDbSubscribers = async () => {
        setLoadingDbSubscribers(true);
        try {
            const res = await api.get(`/admin/communication/subscribers?page=${dbPage}&search=${dbSearch}`);
            if (res.data && res.data.data) {
                setDbSubscribers(res.data.data);
                setDbTotalCount(res.data.total);
                setDbTotalPages(res.data.last_page);
            } else if (Array.isArray(res.data)) {
                setDbSubscribers(res.data);
                setDbTotalCount(res.data.length);
                setDbTotalPages(1);
            } else {
                setDbSubscribers([]);
                setDbTotalCount(0);
                setDbTotalPages(1);
            }
        } catch (error) {
            console.error("Failed to load subscribers from database", error);
            showToast("Failed to fetch database subscribers", "error");
        } finally {
            setLoadingDbSubscribers(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'wizard' && currentStep === 2 && audienceSource === 'database') {
            const timer = setTimeout(() => {
                fetchDbSubscribers();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [dbPage, dbSearch, audienceSource, currentStep, viewMode]);

    const getCsvPageContacts = () => {
        const start = (csvPage - 1) * csvPageSize;
        return csvContacts.slice(start, start + csvPageSize);
    };

    const isAllCsvSelectedOnPage = () => {
        const pageContacts = getCsvPageContacts();
        if (pageContacts.length === 0) return false;
        return pageContacts.every(c => selectedCsvEmails.includes(c.email));
    };

    const handleSelectAllCsvOnPage = () => {
        const pageContacts = getCsvPageContacts();
        const pageEmails = pageContacts.map(c => c.email);
        
        if (isAllCsvSelectedOnPage()) {
            setSelectedCsvEmails(prev => prev.filter(email => !pageEmails.includes(email)));
        } else {
            setSelectedCsvEmails(prev => {
                const union = new Set([...prev, ...pageEmails]);
                return Array.from(union);
            });
        }
    };

    const handleToggleCsvSubscriber = (email: string) => {
        setSelectedCsvEmails(prev => {
            if (prev.includes(email)) {
                return prev.filter(e => e !== email);
            } else {
                return [...prev, email];
            }
        });
    };

    const isAllDbSelectedOnPage = () => {
        if (dbSubscribers.length === 0) return false;
        return dbSubscribers.every(sub => selectedDbIds.includes(sub.id));
    };

    const handleSelectAllDbOnPage = () => {
        const pageIds = dbSubscribers.map(s => s.id);
        if (isAllDbSelectedOnPage()) {
            setSelectedDbIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedDbIds(prev => {
                const union = new Set([...prev, ...pageIds]);
                return Array.from(union);
            });
        }
    };

    const handleToggleDbSubscriber = (id: number) => {
        setSelectedDbIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.name.endsWith('.csv')) {
            parseCsvFile(file);
        } else {
            showToast("Please drop a valid .csv file", "error");
        }
    };

    const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        parseCsvFile(file);
    };

    const parseCsvFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;
            
            const lines = text.split(/\r?\n/);
            const headers = lines[0]?.toLowerCase().split(',').map(h => h.trim()) || [];
            
            const emailIndex = headers.indexOf('email');
            const nameIndex = headers.indexOf('name');
            const phoneIndex = headers.indexOf('phone');
            
            if (emailIndex === -1) {
                showToast("CSV file must contain an 'email' column", "error");
                return;
            }

            const parsed: Array<{ name: string; email: string; phone: string }> = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]?.trim();
                if (!line) continue;
                
                const values = line.split(',').map(v => v.replace(/^["']|["']$/g, '').trim());
                const email = values[emailIndex];
                if (!email || !email.includes('@')) continue;

                const name = nameIndex !== -1 ? values[nameIndex] || '' : '';
                const phone = phoneIndex !== -1 ? values[phoneIndex] || '' : '';

                parsed.push({ name, email, phone });
            }

            setCsvContacts(parsed);
            setSelectedCsvEmails(parsed.map(p => p.email));
            setCsvPage(1);
            showToast(`Parsed ${parsed.length} contacts from CSV`, "success");
        };
        reader.readAsText(file);
    };

    const getEmailTemplateHTML = (templateId: string, subject: string, customBody?: string) => {
        if (customBody) {
            return customBody;
        }
        return `<div style="color: #9c1226; font-size: 12px; text-align: center; padding: 40px; font-family: sans-serif;">No template content designed yet. Use the Visual or HTML Code editor to write your layout.</div>`;
    };

    const insertTagAtCursor = (tag: string) => {
        setFormData(prev => ({ ...prev, subject: (prev.subject || '') + ' ' + tag }));
        showToast(`Inserted ${tag} into subject line`, 'success');
    };

    const copyTagToClipboard = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 2000);
        showToast(`Copied ${tag} to clipboard`, 'success');
    };

    const downloadSampleCsv = (e: React.MouseEvent) => {
        e.stopPropagation();
        const csvContent = "\ufeffName,Email,Phone\nAhmed Farhan,ahmedfarhan@example.com,+919876543210\nJohn Doe,johndoe@example.com,+1234567890\nJane Smith,janesmith@example.com,+447911123456";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "cureza_broadcast_sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCreateCampaign = () => {
        setViewMode('wizard');
        setCurrentStep(1);
        setAudienceSource(null);
        setSelectedDbIds([]);
        setSelectedCsvEmails([]);
        setCsvContacts([]);
        setDbSearch('');
        setDbPage(1);
        setCsvPage(1);
        setIsScheduled(false);

        setFormData({
            title: '',
            type: 'standard',
            channel: 'email',
            subject: '',
            preheader: 'Wellness recommendations selected for you.',
            segment: 'custom',
            template: 'custom',
            bodyText: '',
            scheduled_at: '',
            throttle_rate: 'immediate',
            rules: []
        });
    };

    const handleTemplateChange = (tempKey: string) => {
        const matchedDb = dbTemplates.find(t => (t.key || String(t.id)) === tempKey);
        if (matchedDb) {
            setFormData(prev => ({
                ...prev,
                template: tempKey,
                subject: matchedDb.subject || '',
                bodyText: matchedDb.body || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                template: tempKey,
                subject: '',
                bodyText: ''
            }));
        }
    };

    const handleLaunchCampaign = async () => {
        if (!formData.title) {
            return showToast("Please enter a campaign title", "error");
        }
        if (!formData.subject) {
            return showToast("Please enter email subject line", "error");
        }
        if (isScheduled && !formData.scheduled_at) {
            return showToast("Please select a date and time to schedule the broadcast", "error");
        }

        const count = audienceSource === 'database' ? selectedDbIds.length : selectedCsvEmails.length;
        if (count === 0) {
            return showToast("Please select at least 1 subscriber to launch", "error");
        }

        setIsSending(true);
        try {
            const matchedDb = dbTemplates.find(t => (t.key || String(t.id)) === formData.template);
            const templateName = matchedDb ? matchedDb.name : (formData.template || 'custom');

            const payloadSettings: any = {
                type: formData.type,
                throttle_rate: formData.throttle_rate
            };

            if (audienceSource === 'database') {
                payloadSettings.rules = [
                    { field: 'selected_ids', operator: 'in', value: selectedDbIds.join(',') }
                ];
            } else {
                const selectedContacts = csvContacts.filter(c => selectedCsvEmails.includes(c.email));
                payloadSettings.csv_contacts = selectedContacts;
            }

            await api.post('/admin/campaigns', {
                title: formData.title,
                channel: 'email',
                subject: formData.subject,
                segment: audienceSource === 'database' 
                    ? `Selected Database Subscribers (${selectedDbIds.length})` 
                    : `Uploaded CSV Contacts (${selectedCsvEmails.length})`,
                template: templateName,
                body: formData.bodyText || null,
                settings: payloadSettings,
                scheduled_at: isScheduled ? (formData.scheduled_at || null) : null
            });

            if (isScheduled && formData.scheduled_at) {
                showToast("Broadcast scheduled successfully!", "success");
            } else {
                showToast("Broadcast dispatched successfully to background queue!", "success");
            }

            setViewMode('list');
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to launch campaign:', error);
            showToast('Failed to launch campaign into database queue', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'sent': return 'Delivered';
            case 'sending': return 'Sending';
            case 'scheduled': return 'Scheduled';
            case 'queued': return 'Queued';
            default: return 'Failed';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'sent': return 'text-emerald-700 bg-emerald-50/50';
            case 'sending': return 'text-amber-700 bg-amber-50/50';
            case 'scheduled': return 'text-blue-700 bg-blue-50/50';
            case 'queued': return 'text-neutral-700 bg-neutral-100/50';
            default: return 'text-red-700 bg-red-50/50';
        }
    };

    const getRuleSummaryText = (campaign: Campaign) => {
        return campaign.segment || 'All Subscribers';
    };

    const filteredCampaigns = campaigns.filter(c => c.channel === 'email');

    return (
        <div className="space-y-6 pb-12">
            {viewMode === 'list' ? (
                <>
                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-[8px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] shadow-none">
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold text-[#052326] tracking-tight">Campaign & Broadcast Center</h1>
                            <p className="text-xs text-[#052326]/70 font-normal">Create and manage multi-step, dynamic, rate-throttled promotions</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    if (activeTab === 'campaigns') fetchCampaigns();
                                    else if (activeTab === 'templates') fetchTemplates();
                                    else {
                                        fetchTabCustomers(tabCustomerPage, tabCustomerSearch);
                                        fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch);
                                    }
                                }}
                                className="p-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-neutral-50 shadow-none transition-colors"
                            >
                                <RefreshCw size={14} className={loading || loadingTemplates ? 'animate-spin' : ''} />
                            </button>
                            <button 
                                onClick={handleCreateCampaign}
                                className="bg-[#052326] text-white px-4 py-2 rounded-[8px] flex items-center gap-2 hover:bg-neutral-900 transition-colors font-medium text-xs shadow-none"
                            >
                                <Plus size={14} />
                                Create Broadcast Wizard
                            </button>
                        </div>
                    </div>

                    {/* Tabs navigation */}
                    <div className="flex border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] mb-6">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                                activeTab === 'campaigns'
                                    ? 'border-[#052326] text-[#052326]'
                                    : 'border-transparent text-neutral-400 hover:text-[#052326]'
                            }`}
                        >
                            Campaigns & Broadcasts
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                                activeTab === 'templates'
                                    ? 'border-[#052326] text-[#052326]'
                                    : 'border-transparent text-neutral-400 hover:text-[#052326]'
                            }`}
                        >
                            Email Templates
                        </button>
                        <button
                            onClick={() => setActiveTab('audience')}
                            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                                activeTab === 'audience'
                                    ? 'border-[#052326] text-[#052326]'
                                    : 'border-transparent text-neutral-400 hover:text-[#052326]'
                            }`}
                        >
                            Audience Lists
                        </button>
                    </div>

                    {activeTab === 'campaigns' && (
                        <>
                            {/* Metrics cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] p-5 rounded-[8px] space-y-1 shadow-none">
                                    <span className="text-[10px] text-[#052326]/60 font-medium uppercase tracking-wider block">Sent Broadcasts</span>
                                    <h3 className="text-2xl font-semibold text-[#052326]">
                                        {filteredCampaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.recipients, 0).toLocaleString()}
                                    </h3>
                                    <p className="text-[10px] text-[#052326]/50 font-normal">Delivered email dispatches</p>
                                </div>
                                <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] p-5 rounded-[8px] space-y-1 shadow-none">
                                    <span className="text-[10px] text-[#052326]/60 font-medium uppercase tracking-wider block">Avg. Interaction Rate</span>
                                    <h3 className="text-2xl font-semibold text-[#052326]">
                                        {filteredCampaigns.filter(c => c.status === 'sent').length > 0
                                            ? (filteredCampaigns.filter(c => c.status === 'sent').reduce((sum, c) => sum + c.open_rate, 0) / filteredCampaigns.filter(c => c.status === 'sent').length).toFixed(1) + '%'
                                            : '0.0%'
                                        }
                                    </h3>
                                    <p className="text-[10px] text-[#052326]/50 font-normal">Average open/read rate logs</p>
                                </div>
                                <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] p-5 rounded-[8px] space-y-1 shadow-none">
                                    <span className="text-[10px] text-[#052326]/60 font-medium uppercase tracking-wider block">Scheduled</span>
                                    <h3 className="text-2xl font-semibold text-[#D4AF37]">
                                        {filteredCampaigns.filter(c => c.status === 'scheduled').length}
                                    </h3>
                                    <p className="text-[10px] text-[#052326]/50 font-normal">Active future crons</p>
                                </div>
                                <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] p-5 rounded-[8px] space-y-1 shadow-none">
                                    <span className="text-[10px] text-[#052326]/60 font-medium uppercase tracking-wider block">Active Queue Status</span>
                                    <h3 className="text-2xl font-semibold text-[#052326] flex items-center gap-1.5">
                                        {filteredCampaigns.some(c => c.status === 'queued' || c.status === 'sending') ? (
                                            <>
                                                <span className="h-3 w-3 bg-[#D4AF37] rounded-full animate-ping" />
                                                <span className="text-neutral-800">Processing</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400">Idle</span>
                                        )}
                                    </h3>
                                    <p className="text-[10px] text-[#052326]/50 font-normal">Queue scheduler agent status</p>
                                </div>
                            </div>

                            {selectedCampaignIds.length > 0 && (
                                <div className="bg-[#F8F3EF] border border-black/5 !border-color-[rgba(85,85,85,0.18)] px-4 py-3 rounded-[8px] flex items-center justify-between text-xs mb-4">
                                    <span className="font-semibold text-[#052326]">
                                        {selectedCampaignIds.length} campaign{selectedCampaignIds.length > 1 ? 's' : ''} selected
                                    </span>
                                    <button
                                        onClick={handleBulkDeleteCampaigns}
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-[8px] transition-colors flex items-center gap-1.5 shadow-none"
                                    >
                                        <Trash2 size={12} />
                                        Delete Selected
                                    </button>
                                </div>
                            )}

                            {/* Campaigns Grid List */}
                            <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] shadow-none overflow-hidden">
                                {loading ? (
                                    <div className="flex h-64 items-center justify-center">
                                        <Loader2 className="animate-spin text-black" size={24} />
                                    </div>
                                ) : filteredCampaigns.length === 0 ? (
                                    <div className="flex h-64 flex-col items-center justify-center text-gray-400 text-xs">
                                        <Inbox size={24} className="mb-2 text-neutral-300" />
                                        No campaigns found in your Cureza system.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-50 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] text-neutral-600 font-semibold">
                                                    <th className="p-4 w-12 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedCampaignIds(filteredCampaigns.map(c => c.id));
                                                                } else {
                                                                    setSelectedCampaignIds([]);
                                                                }
                                                            }}
                                                            className="rounded border-[#052326]/20 text-[#052326] focus:ring-[#052326]/50 cursor-pointer h-3.5 w-3.5"
                                                        />
                                                    </th>
                                                    <th className="p-4">Title</th>
                                                    <th className="p-4">Segment / Target Criteria</th>
                                                    <th className="p-4">Recipient Count</th>
                                                    <th className="p-4">Progress / Stats</th>
                                                    <th className="p-4">Status</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {filteredCampaigns.map(c => (
                                                    <tr key={c.id} className="hover:bg-neutral-50/30 transition-colors">
                                                        <td className="p-4 w-12 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCampaignIds.includes(c.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedCampaignIds(prev => [...prev, c.id]);
                                                                    } else {
                                                                        setSelectedCampaignIds(prev => prev.filter(id => id !== c.id));
                                                                    }
                                                                }}
                                                                className="rounded border-[#052326]/20 text-[#052326] focus:ring-[#052326]/50 cursor-pointer h-3.5 w-3.5"
                                                            />
                                                        </td>
                                                        <td className="p-4 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="p-1.5 bg-neutral-100 text-[#052326] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px]">
                                                                    <Mail size={14} />
                                                                </span>
                                                                <span className="font-semibold text-gray-900">{c.title}</span>
                                                                {c.settings?.type === 'ab_test' && (
                                                                    <span className="bg-[#D4AF37]/10 text-[#052326] text-[8px] font-semibold px-1.5 py-0.5 rounded-[8px] border border-[#D4AF37]/20 flex items-center gap-0.5">
                                                                        <Sparkles size={8} /> A/B Test
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 max-w-xs truncate text-gray-500 font-normal">
                                                            {getRuleSummaryText(c)}
                                                        </td>
                                                        <td className="p-4 font-semibold text-gray-800">
                                                            {c.recipients.toLocaleString()}
                                                        </td>
                                                        <td className="p-4 space-y-1">
                                                            {c.status === 'sending' ? (
                                                                <div className="w-32 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                                    <div className="bg-[#052326] h-1.5 rounded-full" style={{ width: `${c.delivered}%` }} />
                                                                </div>
                                                            ) : c.status === 'sent' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-gray-900">{c.open_rate}%</span>
                                                                    <span className="text-[10px] text-gray-400 font-normal">interaction</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 font-normal">-</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[8px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] ${getStatusStyle(c.status)}`}>
                                                                {getStatusText(c.status)}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => handleDuplicateCampaign(c.id)}
                                                                className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-[8px] transition-colors border border-transparent hover:border-neutral-200"
                                                                title="Duplicate Campaign"
                                                            >
                                                                <Copy size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCampaign(c.id)}
                                                                className="p-1.5 text-red-650 hover:bg-red-50 rounded-[8px] transition-colors border border-transparent hover:border-red-200"
                                                                title="Delete Campaign"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'templates' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] p-6 rounded-[8px] shadow-none flex justify-between items-center">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-[#052326]">Manage Email Templates</h3>
                                    <p className="text-xs text-[#052326]/70">Create, edit, and maintain standard HTML email templates</p>
                                </div>
                                <button
                                    onClick={() => handleOpenTemplateModal()}
                                    className="bg-[#052326] text-white px-4 py-2 rounded-[8px] flex items-center gap-2 hover:bg-neutral-900 transition-colors font-medium text-xs shadow-none"
                                >
                                    <Plus size={14} /> Create Template
                                </button>
                            </div>

                            <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] shadow-none overflow-hidden">
                                {loadingTemplates ? (
                                    <div className="flex h-64 items-center justify-center">
                                        <Loader2 className="animate-spin text-black" size={24} />
                                    </div>
                                ) : dbTemplates.length === 0 ? (
                                    <div className="flex h-64 flex-col items-center justify-center text-gray-400 text-xs">
                                        <Inbox size={24} className="mb-2 text-neutral-300" />
                                        No templates found in your system.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-50 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] text-neutral-600 font-semibold">
                                                    <th className="p-4">Key</th>
                                                    <th className="p-4">Name</th>
                                                    <th className="p-4">Subject</th>
                                                    <th className="p-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {dbTemplates.map(t => (
                                                    <tr key={t.id} className="hover:bg-neutral-50/30 transition-colors">
                                                        <td className="p-4 font-mono font-medium text-gray-700">{t.key}</td>
                                                        <td className="p-4 font-semibold text-gray-900">{t.name}</td>
                                                        <td className="p-4 text-gray-500 font-normal">{t.subject}</td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <button
                                                                onClick={() => handleOpenTemplateModal(t)}
                                                                className="inline-flex items-center p-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-neutral-50 text-neutral-700 transition-colors"
                                                                title="Edit Template"
                                                            >
                                                                <Edit size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTemplate(t.id)}
                                                                className="inline-flex items-center p-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-red-50 text-red-650 transition-colors"
                                                                title="Delete Template"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'audience' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Customers Column */}
                            <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] p-5 space-y-4 shadow-none">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#052326]">Customers Database</h3>
                                        <p className="text-[10px] text-gray-400 font-normal">Active consumers registered on the shop ({tabCustomerTotalCount} total)</p>
                                    </div>
                                    <span className="p-1.5 bg-[#052326]/5 text-[#052326] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold">
                                        API Verified
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search customers by name/email..."
                                        value={tabCustomerSearch}
                                        onChange={e => {
                                            setTabCustomerSearch(e.target.value);
                                            setTabCustomerPage(1);
                                        }}
                                        className="flex-1 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                                    />
                                    <button
                                        onClick={() => fetchTabCustomers(tabCustomerPage, tabCustomerSearch)}
                                        className="px-3 py-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-neutral-50 text-xs font-semibold transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] overflow-hidden">
                                    <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-50 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] text-neutral-600 font-semibold sticky top-0">
                                                    <th className="p-3">Name</th>
                                                    <th className="p-3">Email</th>
                                                    <th className="p-3">Phone</th>
                                                    <th className="p-3">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {loadingTabCustomers ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-8 text-center">
                                                            <Loader2 className="animate-spin text-neutral-400 mx-auto" size={20} />
                                                        </td>
                                                    </tr>
                                                ) : tabCustomers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="p-8 text-center text-gray-400 font-normal">
                                                            No customers found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tabCustomers.map(cust => (
                                                        <tr key={cust.id} className="hover:bg-neutral-50/30 transition-colors">
                                                            <td className="p-3 font-semibold text-gray-900">{cust.name}</td>
                                                            <td className="p-3 text-gray-500 font-normal">{cust.email}</td>
                                                            <td className="p-3 text-gray-500 font-normal">{cust.phone}</td>
                                                            <td className="p-3 text-gray-400 font-normal">{cust.joined}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {tabCustomerTotalPages > 1 && (
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-[10px] text-gray-400 font-normal">
                                            Page {tabCustomerPage} of {tabCustomerTotalPages}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={tabCustomerPage === 1}
                                                onClick={() => setTabCustomerPage(prev => Math.max(1, prev - 1))}
                                                className="px-2.5 py-1 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                                            >
                                                Prev
                                            </button>
                                            <button
                                                disabled={tabCustomerPage === tabCustomerTotalPages}
                                                onClick={() => setTabCustomerPage(prev => Math.min(tabCustomerTotalPages, prev + 1))}
                                                className="px-2.5 py-1 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Subscribers Column */}
                            <div className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] p-5 space-y-4 shadow-none">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#052326]">Newsletter Subscribers</h3>
                                        <p className="text-[10px] text-gray-400 font-normal">Subscribers configured for communication campaigns ({tabSubscriberTotalCount} total)</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            ref={subFileInputRef}
                                            onChange={handleSubCsvFileChange}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => subFileInputRef.current?.click()}
                                            className="px-2.5 py-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] bg-white text-[#052326] rounded-[8px] text-[10px] font-semibold hover:bg-neutral-50 transition-colors flex items-center gap-1 shadow-none"
                                        >
                                            <Mail size={12} className="text-[#D4AF37]" />
                                            Import CSV
                                        </button>
                                        <button
                                            onClick={() => openSubModal()}
                                            className="px-2.5 py-1.5 bg-[#052326] text-white rounded-[8px] text-[10px] font-semibold hover:bg-neutral-900 transition-colors flex items-center gap-1 shadow-none"
                                        >
                                            <Plus size={12} className="text-[#D4AF37]" />
                                            Add Subscriber
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search subscribers by name/email..."
                                        value={tabSubscriberSearch}
                                        onChange={e => {
                                            setTabSubscriberSearch(e.target.value);
                                            setTabSubscriberPage(1);
                                        }}
                                        className="flex-1 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                                    />
                                    <button
                                        onClick={() => fetchTabSubscribers(tabSubscriberPage, tabSubscriberSearch)}
                                        className="px-3 py-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-neutral-50 text-xs font-semibold transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {/* Bulk Actions Bar */}
                                {selectedSubIds.length > 0 && (
                                    <div className="bg-[#F8F3EF] p-2.5 rounded-[8px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] flex items-center justify-between text-xs animate-in fade-in duration-200">
                                        <span className="font-semibold text-[#052326]">{selectedSubIds.length} selected</span>
                                        <div className="flex gap-1.5 items-center">
                                            <span className="text-[9px] text-[#052326]/60 font-semibold uppercase">Mark As:</span>
                                            <button 
                                                onClick={() => handleBulkStatusUpdate('subscribed')}
                                                className="px-2 py-1 bg-white hover:bg-neutral-50 text-[#052326] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold transition-colors"
                                                disabled={isBulkUpdating}
                                            >
                                                Subscribed
                                            </button>
                                            <button 
                                                onClick={() => handleBulkStatusUpdate('unsubscribed')}
                                                className="px-2 py-1 bg-white hover:bg-neutral-50 text-[#052326] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold transition-colors"
                                                disabled={isBulkUpdating}
                                            >
                                                Unsubscribed
                                            </button>
                                            <button 
                                                onClick={() => handleBulkStatusUpdate('pending')}
                                                className="px-2 py-1 bg-white hover:bg-neutral-50 text-[#052326] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold transition-colors"
                                                disabled={isBulkUpdating}
                                            >
                                                Pending
                                            </button>
                                            <span className="h-4 w-px bg-neutral-300 mx-1"></span>
                                            <button 
                                                onClick={handleBulkDelete}
                                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 rounded-[8px] text-[10px] font-semibold transition-colors flex items-center gap-1"
                                                disabled={isBulkUpdating}
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] overflow-hidden">
                                    <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-50 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] text-neutral-600 font-semibold sticky top-0 z-10">
                                                    <th className="p-3 w-10 text-center bg-neutral-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!isAllTabSelectedOnPage()}
                                                            onChange={handleSelectAllTabOnPage}
                                                            className="rounded border-neutral-300 text-[#052326] focus:ring-[#052326] h-3.5 w-3.5"
                                                        />
                                                    </th>
                                                    <th className="p-3 bg-neutral-50">Name</th>
                                                    <th className="p-3 bg-neutral-50">Email</th>
                                                    <th className="p-3 bg-neutral-50">Status</th>
                                                    <th className="p-3 bg-neutral-50">Tags</th>
                                                    <th className="p-3 bg-neutral-50 text-right pr-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {loadingTabSubscribers ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center">
                                                            <Loader2 className="animate-spin text-neutral-400 mx-auto" size={20} />
                                                        </td>
                                                    </tr>
                                                ) : tabSubscribers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-8 text-center text-gray-400 font-normal">
                                                            No subscribers found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    tabSubscribers.map(sub => (
                                                        <tr key={sub.id} className="hover:bg-neutral-50/30 transition-colors">
                                                            <td className="p-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedSubIds.includes(sub.id)}
                                                                    onChange={() => {
                                                                        setSelectedSubIds(prev => 
                                                                            prev.includes(sub.id) ? prev.filter(id => id !== sub.id) : [...prev, sub.id]
                                                                        );
                                                                    }}
                                                                    className="rounded border-neutral-300 text-[#052326] focus:ring-[#052326] h-3.5 w-3.5"
                                                                />
                                                            </td>
                                                            <td className="p-3 font-semibold text-gray-900">{sub.name || 'N/A'}</td>
                                                            <td className="p-3 text-gray-500 font-normal">{sub.email}</td>
                                                            <td className="p-3">
                                                                <span className={`px-1.5 py-0.5 rounded-[8px] text-[10px] font-semibold border capitalize ${
                                                                    sub.status === 'subscribed' 
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                                        : sub.status === 'unsubscribed'
                                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                                }`}>
                                                                    {sub.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-gray-400 font-normal max-w-[100px] truncate">
                                                                {formatTags(sub.tags)}
                                                            </td>
                                                            <td className="p-3 text-right space-x-1.5 pr-4 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openSubModal(sub)}
                                                                    className="p-1 hover:bg-neutral-100 rounded-md text-gray-500 hover:text-gray-900 transition-colors inline-block"
                                                                    title="Edit Subscriber"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteSubscriber(sub.id)}
                                                                    className="p-1 hover:bg-red-50 rounded-md text-red-500 hover:text-red-700 transition-colors inline-block"
                                                                    title="Delete Subscriber"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {tabSubscriberTotalPages > 1 && (
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-[10px] text-gray-400 font-normal">
                                            Page {tabSubscriberPage} of {tabSubscriberTotalPages}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={tabSubscriberPage === 1}
                                                onClick={() => setTabSubscriberPage(prev => Math.max(1, prev - 1))}
                                                className="px-2.5 py-1 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                                            >
                                                Prev
                                            </button>
                                            <button
                                                disabled={tabSubscriberPage === tabSubscriberTotalPages}
                                                onClick={() => setTabSubscriberPage(prev => Math.min(tabSubscriberTotalPages, prev + 1))}
                                                className="px-2.5 py-1 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[10px] font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* FunnelKit Interactive Wizard View */
                <div className="bg-white rounded-[8px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] shadow-none overflow-hidden flex flex-col min-h-[600px]">
                    {/* Wizard Steps Header */}
                    <div className="bg-neutral-50 p-4 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-neutral-400">Broadcast Creator</span>
                            <ChevronRight size={14} className="text-neutral-350" />
                            <span className="text-xs font-semibold text-[#052326]">{formData.title || 'Untitled Campaign'}</span>
                        </div>
                        <button 
                            onClick={() => setViewMode('list')}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-neutral-100 rounded-lg flex items-center gap-1 text-xs font-medium"
                        >
                            <X size={14} /> Close Wizard
                        </button>
                    </div>

                    <div className="flex border-b border-neutral-100 px-6 py-3 bg-neutral-50/50 justify-between items-center text-xs font-semibold">
                        <div className="flex gap-8">
                            {[
                                { step: 1, label: '1. Setup & Type' },
                                { step: 2, label: '2. Target Audience' },
                                { step: 3, label: '3. Content Designer' },
                                { step: 4, label: '4. Schedule & Pace' },
                                { step: 5, label: '5. Review & Launch' }
                            ].map(s => (
                                <span 
                                    key={s.step} 
                                    className={`pb-1 border-b-2 transition-colors ${
                                        currentStep === s.step ? 'border-[#052326] text-[#052326]' : 'border-transparent text-neutral-400'
                                    }`}
                                >
                                    {s.label}
                                </span>
                            ))}
                        </div>
                        <span className="text-gray-450 font-normal">Step {currentStep} of 5</span>
                    </div>

                    {/* Step Content Area */}
                    <div className="flex-1 p-6">
                        {currentStep === 1 && (
                            <div className="max-w-xl space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-gray-900">Configure Broadcast Campaign Name</h3>
                                    <p className="text-xs text-gray-500 font-normal">This title is for internal tracking and analytics logs.</p>
                                    <input
                                        type="text"
                                        className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black font-semibold outline-none shadow-none mt-2"
                                        placeholder="e.g. November Supplement Mega Discount Offer"
                                        value={formData.title || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value || '' }))}
                                    />
                                    <div className="space-y-3 mt-6">
                                        <h3 className="text-sm font-semibold text-gray-900">Broadcast Type</h3>
                                        <div 
                                            className="p-4 border border-[#052326] bg-[#052326]/5 rounded-[8px] space-y-1"
                                        >
                                            <h4 className="font-semibold text-xs text-[#052326]">Standard Broadcast</h4>
                                            <p className="text-[10px] text-gray-500 font-normal leading-normal">Send a single email to your selected target list instantly or scheduled.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                {audienceSource === null ? (
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                                <Users size={16} className="text-gray-450" />
                                                Define Target Recipients
                                            </h3>
                                            <p className="text-xs text-gray-500 font-normal">Choose whether to select specific subscribers from your database or upload a custom CSV contact list.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div 
                                                onClick={() => setAudienceSource('database')}
                                                className="p-6 bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-[#F8F3EF]/30 hover:border-[#052326]/30 cursor-pointer transition-all space-y-3 flex flex-col justify-between min-h-[160px] shadow-none"
                                            >
                                                <div className="space-y-2">
                                                    <div className="p-2.5 bg-[#052326]/5 text-[#052326] rounded-[8px] w-fit border border-[#052326]/10">
                                                        <Users size={18} />
                                                    </div>
                                                    <h4 className="font-semibold text-sm text-[#052326]">Subscribers Database</h4>
                                                    <p className="text-xs text-gray-500 font-normal leading-relaxed">
                                                        Select specific contacts directly from your shop's database. Filter, paginate, and choose the target recipients.
                                                    </p>
                                                </div>
                                                <div className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5 self-end">
                                                    Select Database <ArrowRight size={14} />
                                                </div>
                                            </div>

                                            <div 
                                                onClick={() => setAudienceSource('csv')}
                                                className="p-6 bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-[#F8F3EF]/30 hover:border-[#052326]/30 cursor-pointer transition-all space-y-3 flex flex-col justify-between min-h-[160px] shadow-none"
                                            >
                                                <div className="space-y-2">
                                                    <div className="p-2.5 bg-[#052326]/5 text-[#052326] rounded-[8px] w-fit border border-[#052326]/10">
                                                        <Mail size={18} />
                                                    </div>
                                                    <h4 className="font-semibold text-sm text-[#052326]">Upload CSV List</h4>
                                                    <p className="text-xs text-gray-500 font-normal leading-relaxed">
                                                        Upload a custom contact list from a CSV file. Parses name, email, and phone fields automatically.
                                                    </p>
                                                </div>
                                                <div className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5 self-end">
                                                    Upload CSV File <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-[#F8F3EF] p-4 rounded-[8px] border border-black/5 !border-color-[rgba(85,85,85,0.18)]">
                                            <div className="space-y-1">
                                                <h3 className="text-[10px] font-semibold text-[#052326] uppercase tracking-wider">
                                                    Target Recipients Source
                                                </h3>
                                                <p className="text-xs text-[#052326]/80 font-normal flex items-center gap-1.5">
                                                    {audienceSource === 'database' ? (
                                                        <>
                                                            <Users size={14} />
                                                            <span>Subscribers Database</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mail size={14} />
                                                            <span>Uploaded CSV Contact List</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAudienceSource(null);
                                                    setSelectedDbIds([]);
                                                    setSelectedCsvEmails([]);
                                                    setCsvContacts([]);
                                                    setDbSearch('');
                                                    setDbPage(1);
                                                    setCsvPage(1);
                                                }}
                                                className="px-3 py-1.5 border border-[#052326]/10 text-[#052326] bg-white rounded-[8px] text-[10px] font-semibold hover:bg-neutral-50 hover:border-[#052326]/20 transition-all flex items-center gap-1 shadow-none"
                                            >
                                                <RefreshCw size={12} />
                                                Change Audience Source
                                            </button>
                                        </div>

                                        {audienceSource === 'database' ? (
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search subscribers by name or email..."
                                                        value={dbSearch || ''}
                                                        onChange={e => {
                                                            setDbSearch(e.target.value || '');
                                                            setDbPage(1);
                                                        }}
                                                        className="flex-1 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={fetchDbSubscribers}
                                                        className="px-3 py-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-neutral-50 text-xs font-semibold transition-colors shadow-none"
                                                    >
                                                        Refresh
                                                    </button>
                                                </div>

                                                <div className="border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] overflow-hidden bg-white shadow-none">
                                                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                                        <table className="w-full text-left text-xs border-collapse">
                                                            <thead>
                                                                <tr className="bg-neutral-50 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] text-neutral-600 font-semibold sticky top-0 z-10">
                                                                    <th className="p-3 w-10 text-center bg-neutral-50">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!isAllDbSelectedOnPage()}
                                                                            onChange={handleSelectAllDbOnPage}
                                                                            className="rounded border-neutral-300 text-[#052326] focus:ring-[#052326] h-3.5 w-3.5"
                                                                        />
                                                                    </th>
                                                                    <th className="p-3 bg-neutral-50">Name</th>
                                                                    <th className="p-3 bg-neutral-50">Email</th>
                                                                    <th className="p-3 bg-neutral-50">Phone</th>
                                                                    <th className="p-3 bg-neutral-50">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-neutral-100">
                                                                {loadingDbSubscribers ? (
                                                                    <tr>
                                                                        <td colSpan={5} className="p-8 text-center">
                                                                            <Loader2 className="animate-spin text-neutral-400 mx-auto" size={20} />
                                                                        </td>
                                                                    </tr>
                                                                ) : dbSubscribers.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan={5} className="p-8 text-center text-gray-400 font-normal">
                                                                            No active subscribers found.
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    dbSubscribers.map(sub => (
                                                                        <tr key={sub.id} className="hover:bg-neutral-50/30 transition-colors">
                                                                            <td className="p-3 text-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!!selectedDbIds.includes(sub.id)}
                                                                                    onChange={() => handleToggleDbSubscriber(sub.id)}
                                                                                    className="rounded border-neutral-300 text-[#052326] focus:ring-[#052326] h-3.5 w-3.5"
                                                                                />
                                                                            </td>
                                                                            <td className="p-3 font-semibold text-gray-900">{sub.name || 'N/A'}</td>
                                                                            <td className="p-3 text-gray-500 font-normal">{sub.email}</td>
                                                                            <td className="p-3 text-gray-500 font-normal">{sub.phone || 'N/A'}</td>
                                                                            <td className="p-3">
                                                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-[8px] text-[10px] font-semibold capitalize">
                                                                                    {sub.status}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Database Pagination */}
                                                {dbTotalPages > 1 && (
                                                    <div className="flex items-center justify-between mt-4">
                                                        <span className="text-xs text-gray-500 font-normal">
                                                            Page {dbPage} of {dbTotalPages} ({dbTotalCount} total subscribers)
                                                        </span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={dbPage === 1}
                                                                onClick={() => setDbPage(prev => Math.max(1, prev - 1))}
                                                                className="px-3 py-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-none"
                                                            >
                                                                Previous
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={dbPage === dbTotalPages}
                                                                onClick={() => setDbPage(prev => Math.min(dbTotalPages, prev + 1))}
                                                                className="px-3 py-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-none"
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Drag & Drop File Upload */}
                                                <div 
                                                    onClick={triggerFileSelect}
                                                    onDragOver={handleDragOver}
                                                    onDrop={handleDrop}
                                                    className="border-2 border-dashed border-[#052326]/20 rounded-[8px] p-8 text-center hover:bg-[#052326]/5 transition-all cursor-pointer space-y-2"
                                                >
                                                    <input
                                                        type="file"
                                                        accept=".csv"
                                                        ref={fileInputRef}
                                                        onChange={handleCsvFileChange}
                                                        className="hidden"
                                                    />
                                                    <div className="flex justify-center text-[#052326]/75">
                                                        <Send size={24} className="rotate-90" />
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-700">
                                                        Click to upload or drag & drop CSV file
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-normal">
                                                        File must contain columns like: Name, Email, Phone
                                                    </p>
                                                    <div className="pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={downloadSampleCsv}
                                                            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#D4AF37] hover:text-[#bfa032] underline decoration-dotted transition-colors"
                                                        >
                                                            Download Sample CSV File
                                                        </button>
                                                    </div>
                                                </div>

                                                {csvContacts.length > 0 && (
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-xs font-semibold text-gray-900">
                                                                Parsed CSV Contacts ({csvContacts.length} total found)
                                                            </h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCsvContacts([]);
                                                                    setSelectedCsvEmails([]);
                                                                    setCsvPage(1);
                                                                }}
                                                                className="text-xs text-red-600 hover:text-red-800 font-semibold"
                                                            >
                                                                Clear File
                                                            </button>
                                                        </div>

                                                        <div className="border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] overflow-hidden bg-white shadow-none">
                                                            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                                                <table className="w-full text-left text-xs border-collapse">
                                                                    <thead>
                                                                        <tr className="bg-neutral-50 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] text-neutral-600 font-semibold sticky top-0 z-10">
                                                                            <th className="p-3 w-10 text-center bg-neutral-50">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!!isAllCsvSelectedOnPage()}
                                                                                    onChange={handleSelectAllCsvOnPage}
                                                                                    className="rounded border-neutral-300 text-[#052326] focus:ring-[#052326] h-3.5 w-3.5"
                                                                                />
                                                                            </th>
                                                                            <th className="p-3 bg-neutral-50">Name</th>
                                                                            <th className="p-3 bg-neutral-50">Email</th>
                                                                            <th className="p-3 bg-neutral-50">Phone</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-neutral-100">
                                                                        {getCsvPageContacts().map((contact, index) => (
                                                                            <tr key={contact.email + index} className="hover:bg-neutral-50/30 transition-colors">
                                                                                <td className="p-3 text-center">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={!!selectedCsvEmails.includes(contact.email)}
                                                                                        onChange={() => handleToggleCsvSubscriber(contact.email)}
                                                                                        className="rounded border-neutral-300 text-[#052326] focus:ring-[#052326] h-3.5 w-3.5"
                                                                                    />
                                                                                </td>
                                                                                <td className="p-3 font-semibold text-gray-900">{contact.name || 'N/A'}</td>
                                                                                <td className="p-3 text-gray-500 font-normal">{contact.email}</td>
                                                                                <td className="p-3 text-gray-500 font-normal">{contact.phone || 'N/A'}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        {/* CSV Pagination */}
                                                        {csvTotalPages > 1 && (
                                                            <div className="flex items-center justify-between mt-4">
                                                                <span className="text-xs text-gray-500 font-normal">
                                                                    Page {csvPage} of {csvTotalPages}
                                                                </span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        disabled={csvPage === 1}
                                                                        onClick={() => setCsvPage(prev => Math.max(1, prev - 1))}
                                                                        className="px-3 py-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-none"
                                                                    >
                                                                        Previous
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={csvPage === csvTotalPages}
                                                                        onClick={() => setCsvPage(prev => Math.min(csvTotalPages, prev + 1))}
                                                                        className="px-3 py-1.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors shadow-none"
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Selected Summary Banner */}
                                        <div className="bg-neutral-50 border border-black/5 !border-color-[rgba(85,85,85,0.18)] p-4 rounded-[8px] flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-normal text-gray-655">
                                                <Users size={16} className="text-gray-450" />
                                                <span>Total Selected Audience:</span>
                                            </div>
                                            <span className="text-sm font-semibold text-[#052326]">
                                                {audienceSource === 'database' ? selectedDbIds.length : selectedCsvEmails.length} subscribers selected
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left editor */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Configure Message Content</h3>
                                        <span className="text-[10px] text-[#052326] font-semibold bg-[#052326]/5 px-2 py-0.5 rounded-[8px] border border-[#052326]/10">
                                            Email Mode
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Subject Line</label>
                                        <input
                                            type="text"
                                            className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black font-semibold outline-none shadow-none"
                                            placeholder="e.g. Buy 1 Get 1 Free this weekend!"
                                            value={formData.subject || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value || '' }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Preheader Text</label>
                                        <input
                                            type="text"
                                            className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none"
                                            placeholder="Short summary appearing next to subject in inbox..."
                                            value={formData.preheader || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, preheader: e.target.value || '' }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Select Reusable Template</label>
                                        <select
                                            value={formData.template}
                                            onChange={e => handleTemplateChange(e.target.value)}
                                            className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                                        >
                                            <option value="custom">-- Custom HTML / Blank Template --</option>
                                            {dbTemplates.map(t => (
                                                <option key={t.key || String(t.id)} value={t.key || String(t.id)}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1 pt-2">
                                        <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Email Body Content</label>
                                        <VisualCodeEditor
                                            value={formData.bodyText || ''}
                                            onChange={val => setFormData(prev => ({ ...prev, bodyText: val }))}
                                            placeholder="Design or write your email campaign content here..."
                                        />
                                        <p className="text-[10px] text-gray-400 font-normal">
                                            This is an editable editor. Modifying the content will make this email campaign dynamic and custom for this run.
                                        </p>
                                    </div>

                                    {/* Merge Tags / Personalization Helper */}
                                    <div className="bg-neutral-50 p-4 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] space-y-3">
                                        <h4 className="text-[10px] font-semibold text-[#052326] uppercase tracking-wider flex items-center gap-1">
                                            <Sparkles size={12} className="text-[#D4AF37]" /> Merge Tags (Personalization Variables)
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {mergeTags.map(t => (
                                                <button
                                                    key={t.tag}
                                                    onClick={() => insertTagAtCursor(t.tag)}
                                                    className="bg-white border border-black/5 !border-color-[rgba(85,85,85,0.18)] text-[10px] font-semibold text-[#052326] px-2.5 py-1.5 rounded-[8px] hover:border-[#052326] transition-colors flex items-center gap-1 shadow-none group"
                                                >
                                                    <span>{t.label}</span>
                                                    <span className="text-gray-400 font-normal text-[8px] group-hover:text-[#052326]">{t.tag}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right preview */}
                                <div className="w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-neutral-100 pt-6 lg:pt-0 lg:pl-6 space-y-3 shrink-0">
                                    <h4 className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                                        <Eye size={14} className="text-gray-450" />
                                        Live Message Preview
                                    </h4>

                                    <div className="border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] overflow-hidden bg-white h-[480px] shadow-none">
                                        <iframe
                                            srcDoc={getEmailTemplateHTML(formData.template, formData.subject, formData.bodyText)}
                                            title="Email Preview"
                                            className="w-full h-full border-0"
                                            sandbox="allow-same-origin"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="max-w-xl space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Schedule Broadcast Timing</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => {
                                                setIsScheduled(false);
                                                setFormData(prev => ({ ...prev, scheduled_at: '' }));
                                            }}
                                            className={`p-4 border rounded-[8px] cursor-pointer transition-all space-y-1 flex items-center gap-3 ${
                                                !isScheduled ? 'border-[#052326] bg-[#052326]/5' : 'border-black/5 !border-color-[rgba(85,85,85,0.18)] hover:bg-neutral-50'
                                            }`}
                                        >
                                            <span className="p-2 bg-neutral-100 text-[#052326] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px]"><Send size={16} /></span>
                                            <div>
                                                <h4 className="font-semibold text-xs text-[#052326]">Immediate Send</h4>
                                                <p className="text-[9px] text-gray-500 font-normal">Dispatches to the queue right away</p>
                                            </div>
                                        </div>
                                        <div 
                                            onClick={() => {
                                                setIsScheduled(true);
                                                setFormData(prev => ({ ...prev, scheduled_at: prev.scheduled_at || new Date(Date.now() + 86400000).toISOString().slice(0, 16) }));
                                            }}
                                            className={`p-4 border rounded-[8px] cursor-pointer transition-all space-y-1 flex items-center gap-3 ${
                                                isScheduled ? 'border-[#052326] bg-[#052326]/5' : 'border-black/5 !border-color-[rgba(85,85,85,0.18)] hover:bg-neutral-50'
                                            }`}
                                        >
                                            <span className="p-2 bg-neutral-100 text-[#052326] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px]"><Calendar size={16} /></span>
                                            <div>
                                                <h4 className="font-semibold text-xs text-[#052326]">Schedule for Later</h4>
                                                <p className="text-[9px] text-gray-500 font-normal">Process via Laravel cron scheduler</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isScheduled && (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none text-neutral-800 font-semibold"
                                            value={formData.scheduled_at || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, scheduled_at: e.target.value || '' }))}
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-1">
                                        <h3 className="text-sm font-semibold text-gray-900">Pace Throttling & Dispatch Limits</h3>
                                        <span title="Enforces delays between messages to prevent rate-limit errors from providers.">
                                            <HelpCircle size={14} className="text-gray-450" />
                                        </span>
                                    </div>
                                    <select
                                        value={formData.throttle_rate}
                                        onChange={e => setFormData(prev => ({ ...prev, throttle_rate: e.target.value as any }))}
                                        className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none"
                                    >
                                        <option value="immediate">Fast (Process full queue immediately)</option>
                                        <option value="medium_60">Medium Throttling (60 dispatches / minute)</option>
                                        <option value="smooth_30">Smooth Throttling (30 dispatches / minute)</option>
                                        <option value="safe_10">Safe Limit Throttling (10 dispatches / minute)</option>
                                    </select>
                                    <p className="text-[10px] text-gray-400 font-normal leading-normal">
                                        Note: Throttling is recommended for bulk email marketing campaigns to maintain a high sender reputation and avoid spam folders.
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="max-w-xl space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                        <CheckCircle2 size={16} className="text-emerald-600" />
                                        Review Campaign Preflight Checklist
                                    </h3>
                                    <p className="text-xs text-gray-500 font-normal">Ensure everything is configured correctly before launching the broadcast campaign.</p>
                                </div>

                                <div className="bg-neutral-50 p-5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] space-y-4">
                                    <div className="flex items-center gap-3 text-xs">
                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                        <span className="font-semibold text-[#052326] w-24">Campaign Name:</span>
                                        <span className="text-gray-655 font-normal">{formData.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                        <span className="font-semibold text-[#052326] w-24">Audience Source:</span>
                                        <span className="text-gray-655 font-normal capitalize">{audienceSource === 'database' ? 'Database Subscribers' : 'CSV Uploaded Contacts'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                        <span className="font-semibold text-[#052326] w-24">Selected Count:</span>
                                        <span className="text-gray-655 font-semibold">{(audienceSource === 'database' ? selectedDbIds.length : selectedCsvEmails.length).toLocaleString()} selected subscribers</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                        <span className="font-semibold text-[#052326] w-24">Timing:</span>
                                        <span className="text-gray-655 font-normal">{isScheduled && formData.scheduled_at ? `Scheduled for ${new Date(formData.scheduled_at).toLocaleString()}` : 'Send Immediately'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                        <span className="font-semibold text-[#052326] w-24">Rate Throttling:</span>
                                        <span className="text-gray-655 font-normal capitalize">{formData.throttle_rate.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-[8px] flex gap-3 text-xs text-amber-800 leading-normal">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <p className="font-normal">
                                        By clicking Launch, your campaign parameters will be stored in the database. Dispatches are irreversible once execution begins. Ensure your content variables are tested.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Wizard Footer Controls */}
                    <div className="p-4 bg-neutral-50 border-t border-black/5 !border-color-[rgba(85,85,85,0.18)] flex justify-between items-center shrink-0">
                        <button
                            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                            disabled={currentStep === 1}
                            className="px-4 py-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold text-neutral-600 hover:bg-white disabled:opacity-50 transition-colors shadow-none"
                        >
                            Back
                        </button>
                        
                        {currentStep < 5 ? (
                            <button
                                onClick={() => {
                                    if (currentStep === 1 && !formData.title) {
                                        return showToast("Please enter a campaign name to proceed", "error");
                                    }
                                    if (currentStep === 2) {
                                        if (!audienceSource) {
                                            return showToast("Please select an audience source first", "error");
                                        }
                                        const count = audienceSource === 'database' ? selectedDbIds.length : selectedCsvEmails.length;
                                        if (count === 0) {
                                            return showToast("Please select at least 1 subscriber to proceed", "error");
                                        }
                                    }
                                    setCurrentStep(prev => Math.min(5, prev + 1));
                                }}
                                className="px-5 py-2 bg-[#052326] text-white rounded-[8px] text-xs font-semibold hover:bg-neutral-900 transition-colors flex items-center gap-1.5 shadow-none"
                            >
                                Continue <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button
                                onClick={handleLaunchCampaign}
                                disabled={isSending}
                                className="px-5 py-2 bg-[#D4AF37] text-[#052326] rounded-[8px] text-xs font-semibold hover:bg-[#bfa032] transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-none"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} />
                                        <span>Launching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={14} />
                                        <span>Launch Campaign</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tutorial / Guidelines Section */}
            <div className="bg-neutral-50 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] p-6 space-y-4 shadow-none">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">Broadcast Center Manual & Integration Guides</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-[#052326]">1. Setup & Type</h4>
                        <p>
                            Configure campaign titles. 
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-[#052326]">2. Target Audience Builder</h4>
                        <p>
                            Define dynamic rule criteria (e.g. orders, spent amounts, tags) using AND logic blocks.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-[#052326]">3. Throttled Sending Mechanism</h4>
                        <p>
                            Once launched, campaigns are processed in chunks to prevent API limits issues by introducing pacing delays.
                        </p>
                    </div>
                </div>
            </div>

            {/* Template Management Dialog/Modal */}
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent className="sm:max-w-[500px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] bg-white shadow-none p-6">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold text-[#052326]">
                            {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2">
                        {!editingTemplate && (
                            <div className="space-y-1">
                                <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Template Key (Unique)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. promotional.winter"
                                    value={templateFormData.key}
                                    onChange={e => setTemplateFormData(prev => ({ ...prev, key: e.target.value }))}
                                    className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                                    required
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Template Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Winter Flash Sale"
                                value={templateFormData.name}
                                onChange={e => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Subject Line</label>
                            <input
                                type="text"
                                placeholder="e.g. Winter Warmth: 20% off all herbal teas! 🍵"
                                value={templateFormData.subject}
                                onChange={e => setTemplateFormData(prev => ({ ...prev, subject: e.target.value }))}
                                className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">HTML Body Content</label>
                            <VisualCodeEditor
                                value={templateFormData.body || ''}
                                onChange={val => setTemplateFormData(prev => ({ ...prev, body: val }))}
                                placeholder="Design or write your template HTML content here..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Theme</label>
                            <select
                                value={templateFormData.theme}
                                onChange={e => setTemplateFormData(prev => ({ ...prev, theme: e.target.value }))}
                                className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <DialogFooter className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsTemplateModalOpen(false)}
                                className="px-4 py-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingTemplate}
                                className="px-4 py-2 bg-[#052326] text-white rounded-[8px] text-xs font-semibold hover:bg-neutral-900 transition-colors disabled:opacity-50 shadow-none"
                            >
                                {isSubmittingTemplate ? 'Saving...' : 'Save Template'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Subscriber Add/Edit Modal */}
            <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
                <DialogContent className="sm:max-w-[450px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] bg-white shadow-none p-6">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold text-[#052326]">
                            {editingSub ? 'Edit Newsletter Subscriber' : 'Add Newsletter Subscriber'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveSubscriber} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                placeholder="subscriber@domain.com"
                                value={subFormData.email}
                                onChange={e => setSubFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold disabled:opacity-50"
                                required
                                disabled={!!editingSub}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={subFormData.name}
                                onChange={e => setSubFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Status</label>
                            <select
                                value={subFormData.status}
                                onChange={e => setSubFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                            >
                                <option value="subscribed">Subscribed</option>
                                <option value="unsubscribed">Unsubscribed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Tags (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. newsletter, customer-vip"
                                value={subFormData.tags}
                                onChange={e => setSubFormData(prev => ({ ...prev, tags: e.target.value }))}
                                className="w-full border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none shadow-none font-semibold"
                            />
                        </div>
                        <DialogFooter className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsSubModalOpen(false)}
                                className="px-4 py-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingSub}
                                className="px-4 py-2 bg-[#052326] text-white rounded-[8px] text-xs font-semibold hover:bg-neutral-900 transition-colors disabled:opacity-50 shadow-none"
                            >
                                {isSubmittingSub ? 'Saving...' : 'Save Subscriber'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* CSV Subscribers Import Confirmation Modal */}
            <Dialog open={isCsvConfirmOpen} onOpenChange={setIsCsvConfirmOpen}>
                <DialogContent className="sm:max-w-[550px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] bg-white shadow-none p-6">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold text-[#052326]">
                            Confirm Subscribers CSV Import
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="bg-[#F8F3EF] p-4 rounded-[8px] border border-black/5 !border-color-[rgba(85,85,85,0.18)] text-xs text-[#052326] leading-relaxed space-y-1 font-normal">
                            <p className="font-semibold text-gray-900">Parsed CSV Summary:</p>
                            <p>File Name: <span className="font-semibold">{csvImportFile?.name}</span></p>
                            <p>Total Valid Rows Found: <span className="font-semibold text-emerald-700">{csvImportContacts.length}</span></p>
                            <p className="text-[10px] text-gray-500">Note: Existing subscriber accounts with matching emails will be merged and updated.</p>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-[10px] font-semibold text-[#052326]/60 uppercase tracking-wider">Preview Parsing Results</h4>
                            <div className="border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] overflow-hidden bg-white shadow-none max-h-[220px] overflow-y-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-neutral-50 border-b border-black/5 !border-color-[rgba(85,85,85,0.18)] text-neutral-600 font-semibold sticky top-0">
                                            <th className="p-2.5 bg-neutral-50">Name</th>
                                            <th className="p-2.5 bg-neutral-50">Email</th>
                                            <th className="p-2.5 bg-neutral-50">Tags</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {csvImportContacts.slice((csvImportPage - 1) * 5, csvImportPage * 5).map((contact, index) => (
                                            <tr key={contact.email + index} className="hover:bg-neutral-50/30 transition-colors">
                                                <td className="p-2.5 font-semibold text-gray-900">{contact.name || 'N/A'}</td>
                                                <td className="p-2.5 text-gray-500 font-normal">{contact.email}</td>
                                                <td className="p-2.5 text-gray-400 font-normal max-w-[120px] truncate">{contact.tags || 'None'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Inner Pagination */}
                            {csvImportContacts.length > 5 && (
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[9px] text-gray-400 font-normal">
                                        Showing {(csvImportPage - 1) * 5 + 1} - {Math.min(csvImportPage * 5, csvImportContacts.length)} of {csvImportContacts.length}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={csvImportPage === 1}
                                            onClick={() => setCsvImportPage(prev => Math.max(1, prev - 1))}
                                            className="px-2 py-0.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[9px] font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            type="button"
                                            disabled={csvImportPage * 5 >= csvImportContacts.length}
                                            onClick={() => setCsvImportPage(prev => prev + 1)}
                                            className="px-2 py-0.5 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-[9px] font-semibold hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCsvConfirmOpen(false);
                                    setCsvImportFile(null);
                                    setCsvImportContacts([]);
                                }}
                                className="px-4 py-2 border border-black/5 !border-color-[rgba(85,85,85,0.18)] rounded-[8px] text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors shadow-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCsvImport}
                                disabled={isImportingCsv}
                                className="px-5 py-2 bg-[#D4AF37] text-[#052326] rounded-[8px] text-xs font-semibold hover:bg-[#bfa032] transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-none"
                            >
                                {isImportingCsv ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} />
                                        <span>Importing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={14} />
                                        <span>Confirm & Import ({csvImportContacts.length})</span>
                                    </>
                                )}
                            </button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );

    function formatTags(tags: any) {
        if (!tags) return 'None';
        if (typeof tags === 'string') return tags;
        if (Array.isArray(tags)) return tags.join(', ');
        if (typeof tags === 'object') {
            return Object.keys(tags).join(', ');
        }
        return 'None';
    }
}
