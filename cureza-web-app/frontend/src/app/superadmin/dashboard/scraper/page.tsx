'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { 
  Play, 
  Download, 
  Trash2, 
  Check, 
  Loader2, 
  Globe, 
  Layers, 
  AlertCircle, 
  ExternalLink,
  Edit2,
  CheckCircle2,
  X,
  Terminal,
  Clock,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ScrapedProduct {
  id: number;
  source_url: string;
  title: string;
  price: string;
  description: string | null;
  images: string[];
  sku: string | null;
  status: string;
}

interface ScrapingTask {
  id: number;
  url: string;
  depth: string;
  status: string;
  total_count: number;
  processed_count: number;
  logs: string[];
  brand?: { id: number; name: string } | null;
  category?: { id: number; name: string } | null;
}

export default function ScraperDashboard() {
  // Scraper Input Form States
  const [targetUrl, setTargetUrl] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [depth, setDepth] = useState('single');
  const [runDirectly, setRunDirectly] = useState(false);
  const [platform, setPlatform] = useState('auto');
  
  // Data lists
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drafts, setDrafts] = useState<ScrapedProduct[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });

  // Task & live updates states
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<ScrapingTask | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Status & loading indicators
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isDraftsLoading, setIsDraftsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  
  // Form overlay / inline editing modal
  const [editingDraft, setEditingDraft] = useState<ScrapedProduct | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    fetchBrandsAndCategories();
    fetchDrafts(1);
    checkForActiveTask();

    return () => {
      stopTimer();
    };
  }, []);

  // Poll active task logs
  useEffect(() => {
    if (!activeTaskId) return;

    fetchTaskStatus(activeTaskId);

    const statusInterval = setInterval(() => {
      fetchTaskStatus(activeTaskId);
    }, 2000);

    return () => clearInterval(statusInterval);
  }, [activeTaskId]);

  // Scroll to bottom of terminal whenever logs update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTask?.logs]);

  const startTimer = (initialOffset = 0) => {
    stopTimer();
    setTimerSeconds(initialOffset);
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const checkForActiveTask = async () => {
    try {
      const res = await api.get('/admin/scraper/active-task');
      const task = res.data;
      if (task && task.id && task.status === 'running') {
        setActiveTaskId(task.id);
        setActiveTask(task);
        const elapsed = Math.max(0, Math.floor((Date.now() - new Date(task.created_at).getTime()) / 1000));
        startTimer(elapsed);
        setMessage({ type: 'info', text: 'Reconnected to running scraper task.' });
      }
    } catch (err) {
      console.error('Failed to check for active task', err);
    }
  };

  const getEta = () => {
    if (!activeTask || activeTask.status !== 'running') return null;
    const remaining = (activeTask.total_count || 0) - (activeTask.processed_count || 0);
    if (remaining <= 0) {
      return activeTask.total_count === 0 ? 'Estimating...' : 'Completing...';
    }
    
    // Average 5.5 seconds per product link
    const totalSecondsLeft = remaining * 5.5;
    const mins = Math.floor(totalSecondsLeft / 60);
    const secs = Math.ceil(totalSecondsLeft % 60);
    
    if (mins > 0) {
      return `~${mins}m ${secs}s`;
    }
    return `~${secs}s`;
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const brandRes = await api.get('/admin/brands');
      setBrands(brandRes.data || []);

      const catRes = await api.get('/admin/categories');
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load scraper dropdown data', err);
    }
  };

  const fetchDrafts = async (page = 1) => {
    setIsDraftsLoading(true);
    try {
      const res = await api.get(`/admin/scraper/products?page=${page}&status=pending`);
      setDrafts(res.data.data || []);
      setSelectedDraftIds([]);
      setPagination({
        current_page: res.data.current_page || 1,
        last_page: res.data.last_page || 1
      });
    } catch (err) {
      console.error('Failed to load drafts', err);
    } finally {
      setIsDraftsLoading(false);
    }
  };

  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const fetchTaskStatus = async (taskId: number) => {
    try {
      const res = await api.get(`/admin/scraper/tasks/${taskId}`);
      const task = res.data;
      setActiveTask(task);

      if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
        setActiveTaskId(null);
        stopTimer();
        fetchDrafts(1);
        if (task.status === 'completed') {
          setMessage({ type: 'success', text: `Scraping completed! ${task.processed_count} product(s) added to review queue.` });
        } else if (task.status === 'cancelled') {
          setMessage({ type: 'info', text: 'Scraping task was cancelled.' });
        } else {
          setMessage({ type: 'error', text: 'Scraping process failed. Check console logs below for errors.' });
        }
      }
    } catch (err) {
      console.error('Failed to fetch task status', err);
    }
  };

  const handleCancelTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to cancel the active scraping job?')) return;
    setIsCancelLoading(true);
    try {
      await api.post(`/admin/scraper/tasks/${taskId}/cancel`);
      setMessage({ type: 'info', text: 'Cancellation request sent to background worker.' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel scraping task.');
    } finally {
      setIsCancelLoading(false);
    }
  };

  const handleSelectDraft = (id: number) => {
    setSelectedDraftIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllDrafts = () => {
    if (selectedDraftIds.length === drafts.length) {
      setSelectedDraftIds([]);
    } else {
      setSelectedDraftIds(drafts.map(d => d.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedDraftIds.length === 0) return;
    if (!confirm(`Are you sure you want to approve & import all ${selectedDraftIds.length} selected products?`)) return;

    setIsBulkActionLoading(true);
    try {
      const res = await api.post('/admin/scraper/products/bulk-approve', {
        ids: selectedDraftIds,
        brand_id: selectedBrand ? parseInt(selectedBrand) : null,
        category_id: selectedCategory ? parseInt(selectedCategory) : null,
      });
      setMessage({ type: 'success', text: res.data.message });
      setSelectedDraftIds([]);
      fetchDrafts(pagination.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to bulk import products.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDraftIds.length === 0) return;
    if (!confirm(`Are you sure you want to discard the ${selectedDraftIds.length} selected product drafts?`)) return;

    setIsBulkActionLoading(true);
    try {
      const res = await api.post('/admin/scraper/products/bulk-delete', {
        ids: selectedDraftIds
      });
      setMessage({ type: 'success', text: res.data.message });
      setSelectedDraftIds([]);
      fetchDrafts(pagination.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to bulk discard products.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleStartScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setIsSubmitLoading(true);
    setMessage(null);
    setActiveTask(null);

    try {
      const res = await api.post('/admin/scraper/start', {
        url: targetUrl,
        brand_id: selectedBrand ? parseInt(selectedBrand) : null,
        category_id: selectedCategory ? parseInt(selectedCategory) : null,
        depth: depth,
        sync: runDirectly,
        platform: platform
      });

      setMessage({ 
        type: runDirectly ? 'success' : 'info', 
        text: runDirectly 
          ? 'Direct sync scraping processed successfully!' 
          : 'Background scraper job dispatched. Connecting console...' 
      });
      
      setTargetUrl('');
      setActiveTaskId(res.data.taskId);
      startTimer(0);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to start web scraping engine.' 
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleOpenEdit = (draft: ScrapedProduct) => {
    setEditingDraft(draft);
    setEditTitle(draft.title || '');
    setEditPrice(draft.price || '');
    setEditBrand(selectedBrand || '');
    setEditCategory(selectedCategory || '');
    setEditDescription(draft.description || '');
  };

  const handleApproveImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft) return;

    setIsActionLoading(editingDraft.id);
    try {
      await api.post(`/admin/scraper/products/${editingDraft.id}/approve`, {
        title: editTitle,
        price: parseFloat(editPrice),
        brand_id: parseInt(editBrand),
        category_id: parseInt(editCategory),
        description: editDescription
      });

      setMessage({ type: 'success', text: `Product "${editTitle}" integrated & published successfully!` });
      setEditingDraft(null);
      fetchDrafts(pagination.current_page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve and import product.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleDeleteDraft = async (id: number) => {
    if (!confirm('Are you sure you want to discard this scraped draft?')) return;

    setIsActionLoading(id);
    try {
      await api.delete(`/admin/scraper/products/${id}`);
      setDrafts(drafts.filter(d => d.id !== id));
      setMessage({ type: 'success', text: 'Scraped draft deleted successfully.' });
    } catch (err) {
      console.error('Failed to delete draft', err);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleExportCsv = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/admin/scraper/export`, '_blank');
  };

  const total = activeTask?.total_count || 0;
  const processed = activeTask?.processed_count || 0;
  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-outfit">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cureza-green/10 rounded-2xl text-cureza-green">
                <Globe size={24} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Web Catalog <span className="text-cureza-green">Scraper</span>
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium text-sm">
              Batch import product details automatically from Shopify, WooCommerce, or raw HTML websites directly into Cureza's verified queue.
            </p>
          </div>
          <button 
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl font-black text-xs hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm"
          >
            <Download size={14} className="text-gray-400" /> EXPORT SCRAPED LIST (CSV)
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-5 rounded-2xl border flex items-start gap-3 text-xs font-semibold shadow-sm animate-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400' 
            : message.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400'
            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-550" /> : <AlertCircle size={18} className="shrink-0 text-amber-550" />}
          <div className="space-y-1">
            <h4 className="font-bold text-sm uppercase tracking-wider">Scraper Engine Notification</h4>
            <p className="font-medium text-xs leading-relaxed">{message.text}</p>
          </div>
        </div>
      )}

      {/* 2. Active Scraping Progress Panel */}
      {activeTask && (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-3xl shadow-sm space-y-5 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                activeTask.status === 'running' 
                  ? 'bg-amber-500 animate-pulse ring-4 ring-amber-100 dark:ring-amber-950' 
                  : activeTask.status === 'completed'
                  ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950'
                  : 'bg-red-500 ring-4 ring-red-100 dark:ring-red-950'
              }`} />
              <h3 className="font-black text-sm uppercase tracking-widest text-gray-950 dark:text-white">
                Scraper Run Status: <span className={activeTask.status === 'running' ? 'text-amber-550' : 'text-emerald-650 dark:text-emerald-400'}>{activeTask.status}</span>
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-wider">
              {activeTask.status === 'running' && (
                <button
                  onClick={() => handleCancelTask(activeTask.id)}
                  disabled={isCancelLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-100/50 transition-all disabled:opacity-50 font-black"
                >
                  {isCancelLoading ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <>
                      <X size={12} /> CANCEL SCRAPE
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-850 px-3 py-1.5 rounded-xl text-gray-650 dark:text-gray-300">
                <Clock size={12} className="text-cureza-green" />
                <span>ELAPSED: {formatTime(timerSeconds)}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-850 px-3 py-1.5 rounded-xl text-gray-650 dark:text-gray-300">
                PROGRESS: {processed}/{total} PAGES
              </div>
            </div>
          </div>

          {/* Metadata Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-850/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] block">Target Endpoint URI:</span>
              <a 
                href={activeTask.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-cureza-green hover:underline flex items-center gap-1.5 font-bold truncate text-sm"
              >
                {activeTask.url} <ExternalLink size={13} className="shrink-0 text-gray-400" />
              </a>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] block">Brand Mapping:</span>
                <span className="font-extrabold text-gray-950 dark:text-gray-100 text-xs">{activeTask.brand?.name || 'Auto-Detect'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] block">Category Mapping:</span>
                <span className="font-extrabold text-gray-950 dark:text-gray-100 text-xs">{activeTask.category?.name || 'Auto-Detect'}</span>
              </div>
              <div>
                <span className="font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] block">Est. Time Remaining:</span>
                <span className="font-extrabold text-gray-950 dark:text-gray-100 text-xs">{getEta() || 'Calculating...'}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar with emerald theme */}
          {activeTask.status === 'running' && (
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
              <div 
                className="bg-cureza-green h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(progressPercent, total > 0 ? 5 : 0)}%` }}
              />
            </div>
          )}

          {/* Live Logs Terminal with subtle green neon glow */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <Terminal size={14} className="text-cureza-green animate-pulse" />
              <span>Crawl worker console</span>
            </div>
            <div className="bg-neutral-950 text-emerald-400 font-mono p-5 rounded-2xl text-xs overflow-y-auto h-48 space-y-1.5 shadow-2xl border border-neutral-800 shadow-emerald-950/5">
              {activeTask.logs && activeTask.logs.length > 0 ? (
                activeTask.logs.map((log, i) => (
                  <div key={i} className="leading-relaxed whitespace-pre-wrap flex gap-3">
                    <span className="text-neutral-700 select-none">[{i+1}]</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 italic space-y-3">
                  <div>Establishing logs stream from background queue...</div>
                  <div className="text-amber-500 font-semibold text-[11px] mt-2 border border-amber-950/40 p-3.5 rounded-xl bg-amber-950/15 max-w-xl leading-relaxed">
                    💡 Tip: Live console output updates require the queue server to be running.
                    Verify that <code className="bg-black/60 px-1.5 py-0.5 rounded text-white border border-neutral-800 font-mono">php artisan queue:work</code> is running in the Laravel backend terminal.
                  </div>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3. Left side: Form configurations */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-850 pb-4">
            <h2 className="font-black text-xs tracking-widest uppercase text-gray-450 dark:text-gray-400">Scrape Parameters</h2>
            {activeTaskId && (
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 text-yellow-750 rounded-full animate-pulse">
                <Loader2 size={10} className="animate-spin" /> RUNNING
              </span>
            )}
          </div>

          <form onSubmit={handleStartScrape} className="space-y-4">
            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Source Storefront URL</label>
              <div className="relative">
                <input 
                  type="url"
                  placeholder="https://merchant.com/products/example"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green transition-all outline-none"
                  required
                />
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Target Platform */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">CMS platform type</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full h-11 px-3.5 text-xs font-semibold bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green transition-all outline-none cursor-pointer"
              >
                <option value="auto">Auto-Detect CMS Platform</option>
                <option value="shopify">Shopify Store (JSON Schema API)</option>
                <option value="woocommerce">WooCommerce Store (WordPress REST)</option>
                <option value="html">Standard HTML parsing (Static fallback)</option>
              </select>
            </div>

            {/* Default Brand mapping */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Default Brand Assignee</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-11 px-3.5 text-xs font-semibold bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green transition-all outline-none cursor-pointer"
              >
                <option value="">-- Choose Brand --</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Default Category mapping */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Default Category Assignee</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 px-3.5 text-xs font-semibold bg-gray-50/50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green transition-all outline-none cursor-pointer"
              >
                <option value="">-- Choose Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Depth parameters */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Crawl Depth Scope</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepth('single')}
                  className={`flex items-center justify-center gap-1.5 h-11 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                    depth === 'single'
                      ? 'bg-cureza-green text-white border-transparent shadow-lg shadow-green-100 dark:shadow-none'
                      : 'bg-gray-50/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                >
                  <Globe size={13} /> Single Item
                </button>
                <button
                  type="button"
                  onClick={() => setDepth('catalog')}
                  className={`flex items-center justify-center gap-1.5 h-11 text-xs font-black uppercase tracking-wider rounded-xl border transition-all ${
                    depth === 'catalog'
                      ? 'bg-cureza-green text-white border-transparent shadow-lg shadow-green-100 dark:shadow-none'
                      : 'bg-gray-50/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                >
                  <Layers size={13} /> Whole Shop
                </button>
              </div>
            </div>

            {/* Direct execution fallback option */}
            <div className="flex items-center gap-2.5 pt-3 pb-1">
              <input
                type="checkbox"
                id="run-directly"
                checked={runDirectly}
                onChange={(e) => setRunDirectly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-cureza-green focus:ring-cureza-green/20"
              />
              <label htmlFor="run-directly" className="text-xs font-bold text-gray-650 dark:text-gray-300 cursor-pointer select-none">
                Direct Sync Mode <span className="text-[10px] font-normal text-gray-400">(Bypass background queue)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitLoading || !targetUrl || activeTaskId !== null}
              className="w-full h-12 bg-cureza-green hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-green-100 dark:shadow-none hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-2 mt-4 cursor-pointer"
            >
              {isSubmitLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Play size={12} className="fill-white" /> Start Scraper job
                </>
              )}
            </button>
          </form>
        </div>

        {/* 4. Right side: Interactive Review Drafts Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-850 pb-4">
            <h2 className="font-black text-xs tracking-widest uppercase text-gray-450 dark:text-gray-400">Scraped Draft Queue</h2>
            <span className="text-xs font-black text-cureza-green uppercase tracking-wider bg-cureza-green/5 border border-cureza-green/10 px-3 py-1 rounded-full">{drafts.length} Pending Approval</span>
          </div>

          {/* Bulk actions bar */}
          {selectedDraftIds.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-850/20 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 text-xs animate-in slide-in-from-top-3 duration-300">
              <div className="font-extrabold text-gray-950 dark:text-gray-100 uppercase tracking-wider text-[11px]">
                Selected <span className="text-cureza-green">{selectedDraftIds.length}</span> draft product(s)
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleBulkApprove}
                  disabled={isBulkActionLoading}
                  className="flex items-center justify-center gap-1.5 px-4 h-10 bg-cureza-green text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 text-xs w-1/2 sm:w-auto cursor-pointer shadow-md shadow-green-50 dark:shadow-none"
                >
                  {isBulkActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Bulk Import & Publish
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                  className="flex items-center justify-center gap-1.5 px-4 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-rose-600 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all disabled:opacity-50 text-xs w-1/2 sm:w-auto cursor-pointer shadow-sm"
                >
                  {isBulkActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Bulk Discard
                </button>
              </div>
            </div>
          )}

          {isDraftsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 size={32} className="animate-spin text-cureza-green" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading drafts catalog...</span>
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/30 dark:bg-gray-850/10">
              <Globe size={40} className="mb-3 text-gray-300 dark:text-gray-700" />
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">No pending scraped product drafts to review.</span>
              <p className="text-xs text-center max-w-xs mt-1.5 font-medium text-gray-450 dark:text-gray-400 leading-relaxed">Enter a store URL in the left form and run the scraper to populate this list.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead className="bg-gray-50/50 dark:bg-gray-850/50">
                  <tr className="font-black uppercase text-[10px] tracking-wider text-gray-400">
                    <th className="px-5 py-4 w-12 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectedDraftIds.length === drafts.length && drafts.length > 0}
                        onChange={handleSelectAllDrafts}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-cureza-green focus:ring-cureza-green/20 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-4 text-left">Product Details</th>
                    <th className="px-5 py-4 text-left">Suggested Price</th>
                    <th className="px-5 py-4 text-left">SKU</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-bold text-sm">
                  {drafts.map(draft => (
                    <tr 
                      key={draft.id} 
                      className={`hover:bg-gray-50/40 dark:hover:bg-gray-850/20 transition-colors group ${
                        selectedDraftIds.includes(draft.id) ? 'bg-emerald-50/10 dark:bg-emerald-950/5' : ''
                      }`}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedDraftIds.includes(draft.id)}
                          onChange={() => handleSelectDraft(draft.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-cureza-green focus:ring-cureza-green/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                            {draft.images && draft.images.length > 0 ? (
                              <img src={draft.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Globe size={16} className="text-gray-300 dark:text-gray-600" />
                            )}
                          </div>
                          <div className="max-w-[280px] min-w-0">
                            <p className="font-extrabold truncate text-gray-950 dark:text-white" title={draft.title}>{draft.title}</p>
                            <a 
                              href={draft.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[10px] text-cureza-green font-black uppercase tracking-wider flex items-center gap-1 mt-0.5 hover:underline"
                            >
                              Source Link <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-gray-950 dark:text-white font-extrabold">
                        {draft.price ? `₹${parseFloat(draft.price).toLocaleString('en-IN')}` : 'N/A'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-gray-450 dark:text-gray-400 text-xs font-mono">
                        {draft.sku || 'N/A'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                          <button
                            onClick={() => handleOpenEdit(draft)}
                            disabled={isActionLoading === draft.id}
                            className="p-2 text-gray-400 hover:text-cureza-green hover:bg-green-50 dark:hover:bg-green-950/20 rounded-xl transition-all"
                            title="Verify & Map Import"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteDraft(draft.id)}
                            disabled={isActionLoading === draft.id}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                            title="Discard Draft"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 rounded-b-3xl">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => fetchDrafts(pagination.current_page - 1)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wide">Page {pagination.current_page} of {pagination.last_page}</span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchDrafts(pagination.current_page + 1)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Edit, Verify & Map Approval Modal with Premium design */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="bg-gray-50 dark:bg-gray-850/50 px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-widest text-gray-950 dark:text-white">Verify & Map Product</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Approve and publish draft item to catalog</p>
              </div>
              <button onClick={() => setEditingDraft(null)} className="h-8 w-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-150 dark:border-gray-700 shadow-sm transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleApproveImport} className="p-6 overflow-y-auto space-y-4 flex-1 font-semibold text-sm">
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Verified Product Title</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green outline-none font-bold text-sm text-gray-950 dark:text-gray-100 transition-all"
                  required
                />
              </div>

              {/* Product Price */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Selling Price (INR)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green outline-none font-bold text-sm text-gray-950 dark:text-gray-100 transition-all"
                  required
                />
              </div>

              {/* Target Brand mapping */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Assign Brand Registry</label>
                <select
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green outline-none font-bold text-sm text-gray-950 dark:text-gray-100 transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Choose Brand --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Category mapping */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Assign Category Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full h-11 px-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green outline-none font-bold text-sm text-gray-955 dark:text-gray-100 transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Parsed Product Description</label>
                <textarea 
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green outline-none font-medium text-sm text-gray-750 dark:text-gray-300 resize-none transition-all leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingDraft(null)}
                  className="w-1/2 h-11 text-xs font-black uppercase tracking-wider border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-11 text-xs font-black uppercase tracking-wider rounded-xl bg-cureza-green text-white flex items-center justify-center gap-1.5 hover:bg-green-700 transition-all shadow-md shadow-green-50 dark:shadow-none"
                >
                  <Check size={14} /> Import & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
