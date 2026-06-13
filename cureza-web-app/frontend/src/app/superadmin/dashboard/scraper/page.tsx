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
  Clock
} from 'lucide-react';

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

    // Fetch instantly
    fetchTaskStatus(activeTaskId);

    // Poll task status every 2 seconds
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

  // Calculate progress percentage
  const total = activeTask?.total_count || 0;
  const processed = activeTask?.processed_count || 0;
  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-[#052326]">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#052326]/10 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">E-Commerce Web Scraper</h1>
          <p className="text-xs md:text-sm text-[#052326]/60 mt-1 font-light">
            Import product catalogs and details automatically from WordPress/WooCommerce, Shopify, or arbitrary stores into Cureza.
          </p>
        </div>
        <button 
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#052326]/10 text-xs font-bold rounded-full hover:bg-[#F8F3EF] transition-all"
        >
          <Download size={14} /> Export Scraped List (CSV)
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-xs font-semibold ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : message.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 2. Active Scraping Progress Panel */}
      {activeTask && (
        <div className="bg-white border border-[#052326]/10 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                activeTask.status === 'running' 
                  ? 'bg-yellow-400 animate-pulse' 
                  : activeTask.status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`} />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                Scraper Run Status: {activeTask.status}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#052326]/60">
              {activeTask.status === 'running' && (
                <button
                  onClick={() => handleCancelTask(activeTask.id)}
                  disabled={isCancelLoading}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 hover:border-red-200 text-red-600 rounded-full text-[10px] font-bold hover:bg-red-100/50 transition-all disabled:opacity-50"
                >
                  {isCancelLoading ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <>
                      <X size={10} /> Cancel Run
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>Elapsed: {formatTime(timerSeconds)}</span>
              </div>
              <div>
                Progress: {processed}/{total} Pages
              </div>
            </div>
          </div>

          {/* Metadata Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8F3EF]/50 p-4 rounded-xl border border-[#052326]/5 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[#052326]/60 uppercase tracking-wider text-[10px] block">Target Link:</span>
              <a 
                href={activeTask.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#F0C417] hover:underline flex items-center gap-1 font-semibold truncate"
              >
                {activeTask.url} <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="font-bold text-[#052326]/60 uppercase tracking-wider text-[10px] block">Brand:</span>
                <span className="font-semibold text-[#052326]">{activeTask.brand?.name || 'Auto-Detect'}</span>
              </div>
              <div>
                <span className="font-bold text-[#052326]/60 uppercase tracking-wider text-[10px] block">Category:</span>
                <span className="font-semibold text-[#052326]">{activeTask.category?.name || 'Auto-Detect'}</span>
              </div>
              <div>
                <span className="font-bold text-[#052326]/60 uppercase tracking-wider text-[10px] block">Est. Time Left:</span>
                <span className="font-semibold text-[#052326]">{getEta() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {activeTask.status === 'running' && (
            <div className="w-full bg-[#F8F3EF] h-3 rounded-full overflow-hidden border border-[#052326]/5">
              <div 
                className="bg-[#F0C417] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(progressPercent, total > 0 ? 5 : 0)}%` }}
              />
            </div>
          )}

          {/* Live Logs Terminal */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#052326]/60">
              <Terminal size={14} />
              <span>Live Console Output</span>
            </div>
            <div className="bg-neutral-950 text-emerald-400 font-mono p-4 rounded-xl text-xs overflow-y-auto h-40 space-y-1 shadow-inner border border-neutral-800">
              {activeTask.logs && activeTask.logs.length > 0 ? (
                activeTask.logs.map((log, i) => (
                  <div key={i} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                ))
              ) : (
                <div className="text-neutral-500 italic space-y-2">
                  <div>Connecting to worker process logs...</div>
                  <div className="text-amber-500 font-semibold text-[11px] mt-2 border border-amber-950/40 p-2 rounded bg-amber-950/10 max-w-xl">
                    💡 Tip: Background queue jobs require a Laravel worker process. 
                    Make sure you have executed <code className="bg-black/60 px-1.5 py-0.5 rounded text-white border border-neutral-800 font-mono">php artisan queue:work</code> in your backend folder to start importing products and sending live updates to this terminal.
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
        <div className="lg:col-span-4 bg-white border border-[#052326]/10 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm tracking-widest uppercase text-[#052326]/50">Start Scraper</h2>
            {activeTaskId && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 bg-yellow-100 border border-yellow-200 rounded-full text-yellow-800 animate-pulse">
                <Loader2 size={10} className="animate-spin" /> Crawl Active
              </span>
            )}
          </div>

          <form onSubmit={handleStartScrape} className="space-y-4">
            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Target Store/Product URL</label>
              <div className="relative">
                <input 
                  type="url"
                  placeholder="https://example.com/product-slug"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 text-xs font-medium bg-[#F8F3EF] border border-[#052326]/10 rounded-xl focus:ring-2 focus:ring-[#052326]/30 outline-none"
                  required
                />
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#052326]/40" />
              </div>
            </div>

            {/* Target Platform */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Source Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full h-11 px-4 text-xs font-semibold bg-[#F8F3EF] border border-[#052326]/10 rounded-xl focus:ring-2 focus:ring-[#052326]/30 outline-none"
              >
                <option value="auto">Auto-Detect Platform</option>
                <option value="shopify">Shopify Store (JSON API - Fastest)</option>
                <option value="woocommerce">WooCommerce / WordPress</option>
                <option value="html">Standard HTML / Custom Scrape</option>
              </select>
            </div>

            {/* Default Brand mapping */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Map to Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-11 px-4 text-xs font-semibold bg-[#F8F3EF] border border-[#052326]/10 rounded-xl focus:ring-2 focus:ring-[#052326]/30 outline-none"
              >
                <option value="">-- Choose Brand (Optional) --</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Default Category mapping */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#052326]/80">Map to Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 px-4 text-xs font-semibold bg-[#F8F3EF] border border-[#052326]/10 rounded-xl focus:ring-2 focus:ring-[#052326]/30 outline-none"
              >
                <option value="">-- Choose Category (Optional) --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Depth parameters */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#052326]/80 block">Crawl Depth</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepth('single')}
                  className={`flex items-center justify-center gap-1.5 h-11 text-xs font-bold rounded-xl border ${
                    depth === 'single'
                      ? 'bg-[#052326] text-white border-transparent'
                      : 'bg-[#F8F3EF] text-[#052326] border-[#052326]/10 hover:bg-[#F8F3EF]/60'
                  }`}
                >
                  <Globe size={13} /> Single Product
                </button>
                <button
                  type="button"
                  onClick={() => setDepth('catalog')}
                  className={`flex items-center justify-center gap-1.5 h-11 text-xs font-bold rounded-xl border ${
                    depth === 'catalog'
                      ? 'bg-[#052326] text-white border-transparent'
                      : 'bg-[#F8F3EF] text-[#052326] border-[#052326]/10 hover:bg-[#F8F3EF]/60'
                  }`}
                >
                  <Layers size={13} /> Catalog / Shop
                </button>
              </div>
            </div>

            {/* Direct execution fallback option */}
            <div className="flex items-center gap-2 pt-2 pb-1">
              <input
                type="checkbox"
                id="run-directly"
                checked={runDirectly}
                onChange={(e) => setRunDirectly(e.target.checked)}
                className="w-4 h-4 rounded border-[#052326]/10 text-[#F0C417] focus:ring-[#F0C417]"
              />
              <label htmlFor="run-directly" className="text-xs font-bold text-[#052326]/80 cursor-pointer select-none">
                Direct Sync Mode <span className="text-[10px] font-normal text-[#052326]/50">(No background queue)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitLoading || !targetUrl || activeTaskId !== null}
              className="w-full h-11 bg-[#F0C417] text-[#052326] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isSubmitLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Play size={12} className="fill-[#052326]" /> Run Scraper
                </>
              )}
            </button>
          </form>
        </div>

        {/* 4. Right side: Interactive Review Drafts Panel */}
        <div className="lg:col-span-8 bg-white border border-[#052326]/10 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm tracking-widest uppercase text-[#052326]/50">Scraped Draft Queue</h2>
            <span className="text-xs font-bold text-[#052326]/60">{drafts.length} Products Pending Review</span>
          </div>

          {/* Bulk actions bar */}
          {selectedDraftIds.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#F8F3EF] p-4 rounded-xl border border-[#052326]/10 text-xs">
              <div className="font-bold text-[#052326]">
                Selected {selectedDraftIds.length} draft product(s)
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleBulkApprove}
                  disabled={isBulkActionLoading}
                  className="flex items-center justify-center gap-1.5 px-4 h-9 bg-[#052326] text-white font-bold rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 text-[11px] w-1/2 sm:w-auto cursor-pointer"
                >
                  {isBulkActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  Bulk Import & Publish
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkActionLoading}
                  className="flex items-center justify-center gap-1.5 px-4 h-9 bg-white border border-[#052326]/10 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-[11px] w-1/2 sm:w-auto cursor-pointer"
                >
                  {isBulkActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Bulk Discard
                </button>
              </div>
            </div>
          )}

          {isDraftsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#052326]/40 gap-2">
              <Loader2 size={24} className="animate-spin text-[#F0C417]" />
              <span className="text-xs font-semibold">Loading drafts...</span>
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#052326]/40 border border-dashed border-[#052326]/10 rounded-xl bg-[#F8F3EF]/30">
              <Globe size={32} className="mb-2" />
              <span className="text-xs font-semibold">No pending scraped product drafts to review.</span>
              <p className="text-[10px] text-center max-w-xs mt-1 font-light">Enter a store URL in the left form and run the scraper to populate this list.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#052326]/10 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F3EF] border-b border-[#052326]/10 font-bold uppercase text-[10px] tracking-wider text-[#052326]/60">
                    <th className="px-4 py-3 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedDraftIds.length === drafts.length && drafts.length > 0}
                        onChange={handleSelectAllDrafts}
                        className="w-4 h-4 rounded border-[#052326]/10 text-[#F0C417] focus:ring-[#F0C417] cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Suggested Price</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#052326]/5">
                  {drafts.map(draft => (
                    <tr 
                      key={draft.id} 
                      className={`hover:bg-[#F8F3EF]/30 font-medium ${
                        selectedDraftIds.includes(draft.id) ? 'bg-[#F8F3EF]/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedDraftIds.includes(draft.id)}
                          onChange={() => handleSelectDraft(draft.id)}
                          className="w-4 h-4 rounded border-[#052326]/10 text-[#F0C417] focus:ring-[#F0C417] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#052326]/10 bg-gray-50 flex items-center justify-center shrink-0">
                          {draft.images && draft.images.length > 0 ? (
                            <img src={draft.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Globe size={16} className="text-[#052326]/30" />
                          )}
                        </div>
                        <div className="max-w-[280px]">
                          <p className="font-bold truncate text-[#052326]" title={draft.title}>{draft.title}</p>
                          <a 
                            href={draft.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-[#F0C417] font-semibold flex items-center gap-1 mt-0.5 hover:underline"
                          >
                            Source Link <ExternalLink size={10} />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#052326]/90">
                        {draft.price ? `₹${parseFloat(draft.price).toLocaleString('en-IN')}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-[#052326]/60 text-[11px] font-mono">
                        {draft.sku || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(draft)}
                          disabled={isActionLoading === draft.id}
                          className="p-1.5 hover:bg-[#F8F3EF] rounded-md text-[#052326] transition-colors"
                          title="Verify & Map Import"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={isActionLoading === draft.id}
                          className="p-1.5 hover:bg-red-50 rounded-md text-red-600 transition-colors"
                          title="Discard Draft"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => fetchDrafts(pagination.current_page - 1)}
                className="px-4 py-2 border border-[#052326]/10 text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-[#F8F3EF] transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-[#052326]/60">Page {pagination.current_page} of {pagination.last_page}</span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchDrafts(pagination.current_page + 1)}
                className="px-4 py-2 border border-[#052326]/10 text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-[#F8F3EF] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Edit, Verify & Map Approval Modal */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#052326]/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#F8F3EF] p-4 flex justify-between items-center border-b border-[#052326]/10">
              <h3 className="font-extrabold text-sm tracking-wider uppercase">Verify & Map Scraped Product</h3>
              <button onClick={() => setEditingDraft(null)} className="text-[#052326]/50 hover:text-[#052326]">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleApproveImport} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Product Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/70">Verified Title</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold bg-[#F8F3EF] border border-[#052326]/10 rounded-xl outline-none"
                  required
                />
              </div>

              {/* Product Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/70">Suggested Price (INR)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold bg-[#F8F3EF] border border-[#052326]/10 rounded-xl outline-none"
                  required
                />
              </div>

              {/* Target Brand mapping */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/70">Assign Brand</label>
                <select
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold bg-[#F8F3EF] border border-[#052326]/10 rounded-xl outline-none"
                  required
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Target Category mapping */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/70">Assign Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold bg-[#F8F3EF] border border-[#052326]/10 rounded-xl outline-none"
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/70">Product Description</label>
                <textarea 
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-4 text-xs font-medium bg-[#F8F3EF] border border-[#052326]/10 rounded-xl outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDraft(null)}
                  className="w-1/2 h-11 text-xs font-bold border border-[#052326]/10 rounded-xl text-[#052326] hover:bg-[#F8F3EF] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-11 text-xs font-bold rounded-xl bg-[#F0C417] text-[#052326] flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity"
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
