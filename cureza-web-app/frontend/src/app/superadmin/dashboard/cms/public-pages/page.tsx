'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import TiptapEditor from '@/components/TiptapEditor';
import { 
    FileText, 
    Edit, 
    Eye, 
    ArrowLeft, 
    Save, 
    Loader2, 
    CheckCircle, 
    AlertCircle, 
    Globe, 
    Lock,
    ExternalLink,
    Plus,
    Trash2,
    Copy,
    Search,
    Compass
} from 'lucide-react';
import Link from 'next/link';

interface PageData {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    content: string;
    status: 'Published' | 'Draft';
    updated_at: string;
}

const SYSTEM_PAGES = [
    { title: "Home Page", slug: "home", url: "/" },
    { title: "Offers & Coupons", slug: "offers", url: "/offers" },
    { title: "Bestsellers", slug: "bestsellers", url: "/bestsellers" },
    { title: "New Launches", slug: "new-launches", url: "/new-launches" },
    { title: "Shop", slug: "shop", url: "/shop" },
    { title: "FAQs & Help Center", slug: "faq", url: "/faq" },
    { title: "About Us", slug: "about", url: "/about" },
    { title: "Contact Us", slug: "contact", url: "/contact" },
    { title: "Careers", slug: "careers", url: "/careers" },
    { title: "Press & Media", slug: "press", url: "/press" },
    { title: "Returns & Refund Policy", slug: "returns", url: "/returns" },
    { title: "Lab Reports (COA)", slug: "lab-reports", url: "/lab-reports" },
];

export default function PublicPagesManagement() {
    const [pages, setPages] = useState<PageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // View state
    const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'system'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    
    // Form fields state
    const [formTitle, setFormTitle] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formStatus, setFormStatus] = useState<'Published' | 'Draft'>('Published');
    const [formContent, setFormContent] = useState('');
    
    // Auto slug flag
    const [autoSlug, setAutoSlug] = useState(true);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/legal-pages');
            setPages(res.data);
        } catch (err: any) {
            setErrorMessage('Failed to fetch pages.');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (val: string) => {
        setFormTitle(val);
        if (autoSlug && isAdding) {
            const formatted = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setFormSlug(formatted);
        }
    };

    const handleSelectPage = (page: PageData) => {
        setSelectedPage(page);
        setIsAdding(false);
        setFormTitle(page.title);
        setFormSlug(page.slug);
        setFormDescription(page.description || '');
        setFormStatus(page.status);
        setFormContent(page.content);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleStartAdding = () => {
        setIsAdding(true);
        setSelectedPage(null);
        setFormTitle('');
        setFormSlug('');
        setFormDescription('');
        setFormStatus('Published');
        setFormContent('');
        setAutoSlug(true);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleBack = () => {
        setSelectedPage(null);
        setIsAdding(false);
        setSuccessMessage('');
        setErrorMessage('');
        setDeleteConfirmId(null);
        fetchPages();
    };

    const handleSave = async () => {
        if (!formTitle.trim()) {
            setErrorMessage('Page title is required.');
            return;
        }
        if (!formSlug.trim()) {
            setErrorMessage('Page slug is required.');
            return;
        }

        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        const payload = {
            title: formTitle,
            slug: formSlug,
            description: formDescription,
            content: formContent,
            status: formStatus,
        };

        try {
            if (isAdding) {
                const res = await api.post('/admin/legal-pages', payload);
                setSuccessMessage('Custom page created successfully!');
                setTimeout(() => {
                    handleBack();
                }, 1500);
            } else if (selectedPage) {
                const res = await api.put(`/admin/legal-pages/${selectedPage.id}`, payload);
                setSuccessMessage('Page updated successfully!');
                setSelectedPage(res.data.page);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to save the page.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setErrorMessage('');
            setSuccessMessage('');
            await api.delete(`/admin/legal-pages/${id}`);
            setSuccessMessage('Page deleted successfully.');
            setDeleteConfirmId(null);
            fetchPages();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setErrorMessage('Failed to delete the page.');
        }
    };

    const getPublicUrl = (slug: string) => {
        if (slug === 'medical-product-policy') return '/medical-policy';
        if (slug === 'lab-reports-coa') return '/lab-reports';
        if (slug === 'seller-policy') return '/seller/sellerpolicy';
        if (slug === 'doctor-policy') return '/doctor/doctorpolicy';
        return `/legal/${slug}`;
    };

    const handleCopyLink = (url: string) => {
        const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
        navigator.clipboard.writeText(fullUrl);
        setCopiedSlug(url);
        setTimeout(() => setCopiedSlug(null), 2050);
    };

    // Filter pages
    const filteredCustomPages = pages.filter(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSystemPages = SYSTEM_PAGES.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && pages.length === 0) {
        return (
            <div className="w-full space-y-6 flex flex-col justify-center items-center py-20">
                <Loader2 className="animate-spin text-black" size={32} />
                <p className="text-xs text-neutral-500 font-normal animate-pulse">Loading pages...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-6 pb-20">
            {/* Header */}
            {!selectedPage && !isAdding ? (
                <div className="flex justify-between items-center border-b-[0.5px] border-black/10 pb-5">
                    <div>
                        <h2 className="text-sm font-medium text-neutral-900 tracking-tight">Public & Website Pages</h2>
                        <p className="text-neutral-500 text-xs mt-0.5">Create custom dynamic pages or view static core routes in your store</p>
                    </div>
                    <button 
                        onClick={handleStartAdding}
                        className="bg-black hover:bg-neutral-950 text-white px-3.5 py-1.8 rounded-[10px] flex items-center justify-center gap-1.5 font-medium text-xs transition-colors"
                    >
                        <Plus size={14} />
                        Add Custom Page
                    </button>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b-[0.5px] border-black/10 pb-5">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleBack}
                            className="p-2 hover:bg-neutral-50 rounded-[10px] text-neutral-600 transition-colors border-[0.5px] border-black/10"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-neutral-900 text-sm">
                                    {isAdding ? 'Create Dynamic Page' : `Edit: ${formTitle}`}
                                </h3>
                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                    formStatus === 'Published' ? 'bg-green-50 text-green-700 border-[0.5px] border-black/50' : 'bg-neutral-100 text-neutral-800 border-[0.5px] border-black/5'
                                }`}>
                                    {formStatus}
                                </span>
                            </div>
                            <p className="text-neutral-450 text-[10px] mt-0.5">
                                Link: <span className="font-mono text-neutral-700 bg-neutral-50 px-1.5 py-0.5 rounded-[10px] border-[0.5px] border-black/5">{getPublicUrl(formSlug || 'your-slug')}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                        {!isAdding && formStatus === 'Published' && (
                            <Link 
                                href={getPublicUrl(formSlug)} 
                                target="_blank"
                                className="px-3 py-1.5 border-[0.5px] border-black/10 text-neutral-700 rounded-[10px] flex items-center justify-center gap-1.5 font-medium text-xs hover:bg-neutral-50 transition-colors"
                            >
                                <ExternalLink size={14} />
                                View Public Page
                            </Link>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] flex items-center justify-center gap-1.5 font-medium text-xs transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isAdding ? 'Publish Page' : 'Save Content'}
                        </button>
                    </div>
                </div>
            )}

            {/* Alert Notifications */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-black/50 p-4 rounded-lg shadow-none flex items-center gap-3 border-[0.5px]">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span className="text-green-800 text-sm font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-black/50 p-4 rounded-lg shadow-none flex items-center gap-3 border-[0.5px]">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Main view content */}
            {!selectedPage && !isAdding ? (
                <div className="space-y-6">
                    {/* Toolbar / Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Tabs */}
                        <div className="flex border-[0.5px] border-black/10 rounded-[10px] p-0.5 bg-neutral-50/50">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
                                    activeTab === 'all' ? 'bg-white shadow-sm text-black border-[0.5px] border-black/5' : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                            >
                                All Pages
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
                                    activeTab === 'custom' ? 'bg-white shadow-sm text-black border-[0.5px] border-black/5' : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                            >
                                Custom & Legal Pages
                            </button>
                            <button
                                onClick={() => setActiveTab('system')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-all ${
                                    activeTab === 'system' ? 'bg-white shadow-sm text-black border-[0.5px] border-black/5' : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                            >
                                System Core Routes
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by title or slug..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border-[0.5px] border-black/10 rounded-[10px] text-xs font-normal focus:outline-none focus:border-black transition-colors"
                            />
                        </div>
                    </div>

                    {/* Pages List Grid */}
                    <div className="space-y-4">
                        {/* Custom Dynamic/Legal Pages Section */}
                        {(activeTab === 'all' || activeTab === 'custom') && (
                            <div className="space-y-3">
                                {activeTab === 'all' && (
                                    <h4 className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase select-none">
                                        Custom & Legal Pages ({filteredCustomPages.length})
                                    </h4>
                                )}
                                
                                {filteredCustomPages.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3.5">
                                        {filteredCustomPages.map((page) => (
                                            <div 
                                                key={page.id} 
                                                className="bg-white p-4.5 rounded-[10px] border-[0.5px] border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black/35 transition-all shadow-none"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2.5 bg-neutral-50 text-neutral-600 rounded-[10px] border-[0.5px] border-black/5 flex-shrink-0">
                                                        <FileText size={18} className="text-neutral-900" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-neutral-900 text-sm leading-none">{page.title}</h3>
                                                            <span className={`px-1.5 py-0.5 text-[8.5px] font-medium rounded-full ${
                                                                page.status === 'Published' 
                                                                    ? 'bg-green-50 text-green-700 border-[0.5px] border-black/25' 
                                                                    : 'bg-neutral-50 text-neutral-600 border-[0.5px] border-black/5'
                                                            }`}>
                                                                {page.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-neutral-500 max-w-xl font-normal">
                                                            {page.description || 'No description provided.'}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[10px] text-neutral-400 font-normal">
                                                            <span className="font-mono text-neutral-600 bg-neutral-50 border-[0.5px] border-black/5 px-1 py-0.2 rounded">
                                                                {getPublicUrl(page.slug)}
                                                            </span>
                                                            <span>•</span>
                                                            <span>Modified: {new Date(page.updated_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 justify-end border-t-[0.5px] sm:border-0 pt-3 sm:pt-0 border-black/5">
                                                    <button 
                                                        onClick={() => handleCopyLink(getPublicUrl(page.slug))}
                                                        className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-[10px] transition-colors border-[0.5px] border-black/10 flex items-center gap-1 text-[11px]"
                                                        title="Copy public URL"
                                                    >
                                                        <Copy size={12} />
                                                        {copiedSlug === getPublicUrl(page.slug) ? 'Copied!' : 'Copy Link'}
                                                    </button>
                                                    
                                                    {page.status === 'Published' && (
                                                        <Link 
                                                            href={getPublicUrl(page.slug)} 
                                                            target="_blank"
                                                            className="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50 rounded-[10px] transition-colors border-[0.5px] border-black/10"
                                                            title="View Page"
                                                        >
                                                            <Eye size={13} />
                                                        </Link>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => handleSelectPage(page)}
                                                        className="p-2 bg-neutral-50 text-black hover:bg-neutral-100 border-[0.5px] border-black/10 rounded-[10px] transition-colors flex items-center gap-1 text-[11px] font-medium"
                                                    >
                                                        <Edit size={12} />
                                                        Edit
                                                    </button>

                                                    {deleteConfirmId === page.id ? (
                                                        <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-[10px] border-[0.5px] border-red-200">
                                                            <button 
                                                                onClick={() => handleDelete(page.id)}
                                                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-[6px] text-[10px] font-medium"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button 
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="px-2 py-1 bg-white border-[0.5px] border-black/10 text-neutral-700 rounded-[6px] text-[10px]"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setDeleteConfirmId(page.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-[10px] border-[0.5px] border-transparent hover:border-red-200 transition-colors"
                                                            title="Delete Page"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-neutral-50/50 rounded-[10px] border border-dashed border-black/5">
                                        <p className="text-xs text-neutral-500 font-normal">No custom/legal pages found.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* System Pages Section */}
                        {(activeTab === 'all' || activeTab === 'system') && (
                            <div className="space-y-3 pt-4">
                                <h4 className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase select-none">
                                    System Core Pages ({filteredSystemPages.length})
                                </h4>
                                
                                {filteredSystemPages.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {filteredSystemPages.map((page) => (
                                            <div 
                                                key={page.slug} 
                                                className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/10 flex items-center justify-between gap-4 hover:border-black/25 transition-all shadow-none"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-neutral-50 text-neutral-400 rounded-[10px] border-[0.5px] border-black/5 shrink-0">
                                                        <Compass size={16} className="text-neutral-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-neutral-900 text-xs leading-none">{page.title}</h3>
                                                        <span className="font-mono text-[9px] text-neutral-400 block mt-1">
                                                            {page.url}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1.5">
                                                    <button 
                                                        onClick={() => handleCopyLink(page.url)}
                                                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-[8px] transition-colors border-[0.5px] border-black/10"
                                                        title="Copy Path"
                                                    >
                                                        <Copy size={11} />
                                                    </button>
                                                    <Link 
                                                        href={page.url} 
                                                        target="_blank"
                                                        className="p-1.5 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50 rounded-[8px] transition-colors border-[0.5px] border-black/10 flex items-center gap-1 text-[10px] font-medium"
                                                    >
                                                        <ExternalLink size={11} />
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-neutral-50/50 rounded-[10px] border border-dashed border-black/5">
                                        <p className="text-xs text-neutral-500 font-normal">No system pages matched your search.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // EDITOR & CREATOR VIEW
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 p-6 space-y-4 shadow-none">
                            <h3 className="font-medium text-neutral-900 text-sm border-b-[0.5px] border-black/10 pb-2">Page Editor</h3>
                            
                            <div className="prose-editor">
                                <TiptapEditor 
                                    content={formContent} 
                                    onChange={setFormContent} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Metadata & Options Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 p-6 space-y-4 shadow-none">
                            <h3 className="font-medium text-neutral-900 text-sm border-b-[0.5px] border-black/10 pb-2">Page Details</h3>
                            
                            <div className="space-y-4 text-xs font-normal text-neutral-700">
                                {/* Title */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-medium text-neutral-500">Page Title</label>
                                    <input 
                                        type="text" 
                                        value={formTitle}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="e.g. Summer Clearance Rules"
                                        className="w-full px-3 py-2 border-[0.5px] border-black/15 focus:border-black rounded-[10px] text-xs focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Slug */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-[11px] font-medium text-neutral-500">URL Slug</label>
                                        {isAdding && (
                                            <button 
                                                onClick={() => setAutoSlug(!autoSlug)}
                                                className={`text-[9px] font-medium ${autoSlug ? 'text-black' : 'text-neutral-400'}`}
                                            >
                                                {autoSlug ? 'Auto-Sync Active' : 'Manual Edit'}
                                            </button>
                                        )}
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formSlug}
                                        onChange={(e) => {
                                            setFormSlug(e.target.value);
                                            setAutoSlug(false);
                                        }}
                                        placeholder="e.g. summer-clearance"
                                        className="w-full px-3 py-2 border-[0.5px] border-black/15 focus:border-black rounded-[10px] text-xs font-mono focus:outline-none transition-colors bg-neutral-50/50"
                                    />
                                </div>

                                {/* Status */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-medium text-neutral-500">Visibility Status</label>
                                    <select 
                                        value={formStatus}
                                        onChange={(e) => setFormStatus(e.target.value as 'Published' | 'Draft')}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/15 focus:border-black rounded-[10px] text-xs focus:outline-none transition-colors bg-white"
                                    >
                                        <option value="Published">Published (Publicly Accessible)</option>
                                        <option value="Draft">Draft (Restricted / Hidden)</option>
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-medium text-neutral-500">Meta Description</label>
                                    <textarea 
                                        rows={3}
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        placeholder="Enter a brief summary for search engines and headers..."
                                        className="w-full px-3 py-2 border-[0.5px] border-black/15 focus:border-black rounded-[10px] text-xs focus:outline-none transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Page Link Preview Card */}
                        <div className="bg-neutral-50 rounded-[10px] border-[0.5px] border-black/10 p-5 space-y-3 shadow-none">
                            <h4 className="text-neutral-900 font-medium text-xs">Public Page Preview</h4>
                            <div className="bg-white p-3.5 rounded-[8px] border-[0.5px] border-black/5 space-y-2 select-none">
                                <span className="text-[9px] font-bold text-neutral-450 uppercase block tracking-wider leading-none">
                                    {formStatus}
                                </span>
                                <h5 className="font-semibold text-neutral-900 text-xs truncate">
                                    {formTitle || 'Untitled Page'}
                                </h5>
                                <p className="text-[10px] text-neutral-500 line-clamp-2 font-normal">
                                    {formDescription || 'No description added yet. Add a description to help search engines.'}
                                </p>
                                <div className="pt-1.5 border-t border-black/5 flex justify-between items-center text-[10px] text-neutral-400">
                                    <span className="font-mono truncate max-w-[120px]">
                                        {getPublicUrl(formSlug || 'your-slug')}
                                    </span>
                                    <span>Core Router</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
