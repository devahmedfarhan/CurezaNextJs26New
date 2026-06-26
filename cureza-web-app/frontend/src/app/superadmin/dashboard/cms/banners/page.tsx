'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Eye, Image as ImageIcon, Loader2, X, Save, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function AdminBannersPage() {
    const { showToast } = useToast();
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Modal & Form States
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        title: '',
        location: 'Home - Hero Slider',
        status: 'Active',
        image: '',
        link: ''
    });

    const locations = [
        'Home - Hero Slider',
        'Home - Banner Grid',
        'Category - Ayurveda',
        'Category - Wellness',
        'Offers Header'
    ];

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/banners');
            setBanners(response.data || []);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            showToast('Failed to load banners from database', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({
            title: '',
            location: 'Home - Hero Slider',
            status: 'Active',
            image: 'https://placehold.co/600x200',
            link: ''
        });
        setIsOpen(true);
    };

    const handleOpenEdit = (banner: any) => {
        setEditingId(banner.id);
        setForm({
            title: banner.title,
            location: banner.location,
            status: banner.status,
            image: banner.image || 'https://placehold.co/600x200',
            link: banner.link || ''
        });
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/admin/banners/${editingId}`, form);
                showToast('Banner updated successfully!', 'success');
            } else {
                await api.post('/admin/banners', form);
                showToast('New banner added successfully!', 'success');
            }
            setIsOpen(false);
            fetchBanners();
        } catch (error) {
            console.error('Failed to save banner:', error);
            showToast('Failed to save banner parameters', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/admin/banners/${id}`);
            showToast('Banner deleted successfully', 'success');
            fetchBanners();
        } catch (error) {
            console.error('Failed to delete banner:', error);
            showToast('Failed to remove banner from database', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-[10px] border-[0.5px] border-black/50">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Banner Management</h1>
                    <p className="text-xs text-gray-500 font-normal mt-0.5">Configure landing sliders and marketing banners in the CMS database.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchBanners}
                        className="bg-white border-[0.5px] border-black/50 text-gray-700 p-2.5 rounded-[10px] hover:bg-neutral-50 transition-colors"
                        title="Reload Banners"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleOpenCreate}
                        className="bg-black text-white px-4 py-2.5 rounded-[10px] text-xs font-semibold flex items-center gap-2 hover:bg-neutral-900 transition-colors"
                    >
                        <Plus size={16} /> Add New Banner
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-black" size={36} />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Querying CMS Banners...</p>
                    </div>
                </div>
            ) : banners.length === 0 ? (
                <div className="p-16 text-center max-w-sm mx-auto space-y-4 bg-white border-[0.5px] border-black/50 rounded-[10px]">
                    <div className="w-12 h-12 bg-neutral-50 text-neutral-400 rounded-full flex items-center justify-center mx-auto border-[0.5px] border-black/50">
                        <ImageIcon size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">No Banners Configured</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">There are no banners listed in the system. Click the button above to add one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden group flex flex-col justify-between">
                            <div className="h-40 bg-gray-50 relative border-b-[0.5px] border-black/50">
                                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => handleOpenEdit(banner)}
                                        className="p-2 bg-white rounded-full text-black hover:bg-neutral-100 border-[0.5px] border-black/50 shadow-none transition-all"
                                        title="Edit Banner"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(banner.id)}
                                        disabled={deletingId === banner.id}
                                        className="p-2 bg-white rounded-full text-red-650 hover:bg-neutral-100 border-[0.5px] border-black/50 shadow-none transition-all disabled:opacity-50"
                                        title="Delete Banner"
                                    >
                                        {deletingId === banner.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start gap-3">
                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{banner.title}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] border-[0.5px] border-black/10 ${
                                        banner.status === 'Active' ? 'bg-green-50 text-green-700' : 
                                        banner.status === 'Scheduled' ? 'bg-amber-50 text-amber-700' : 'bg-neutral-100 text-neutral-500'
                                    }`}>
                                        {banner.status}
                                    </span>
                                </div>
                                <div className="space-y-1 text-[11px] text-neutral-450 font-normal">
                                    <p className="flex items-center gap-1.5"><ImageIcon size={13} /> {banner.location}</p>
                                    {banner.link && <p className="truncate">Link: <span className="font-mono text-[10px]">{banner.link}</span></p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT OVERLAY MODAL */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[10px] p-6 max-w-md w-full border-[0.5px] border-black/50 space-y-4">
                        <div className="flex items-center justify-between border-b-[0.5px] border-black/50 pb-3">
                            <h4 className="font-semibold text-sm text-neutral-800 uppercase tracking-wider">{editingId ? 'Edit Banner Parameters' : 'Add New Banner'}</h4>
                            <button 
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-neutral-450 hover:text-neutral-600 bg-neutral-50 border-[0.5px] border-black/50 rounded-[8px]"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs font-medium text-neutral-600">
                            <div className="space-y-1">
                                <label>Banner Title</label>
                                <input 
                                    type="text" 
                                    value={form.title} 
                                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] font-medium focus:border-black outline-none bg-white"
                                    placeholder="Enter promotional banner title"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label>Target Location Layout</label>
                                <select 
                                    value={form.location} 
                                    onChange={(e) => setForm({ ...form, location: e.target.value })} 
                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] bg-white outline-none focus:border-black"
                                >
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label>Image URL Path</label>
                                <input 
                                    type="text" 
                                    value={form.image} 
                                    onChange={(e) => setForm({ ...form, image: e.target.value })} 
                                    className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] focus:border-black outline-none bg-white font-mono"
                                    placeholder="Enter image asset path or URL"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label>Action Link URL</label>
                                    <input 
                                        type="text" 
                                        value={form.link} 
                                        onChange={(e) => setForm({ ...form, link: e.target.value })} 
                                        className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] focus:border-black outline-none bg-white"
                                        placeholder="/shop or relative url"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label>Status</label>
                                    <select 
                                        value={form.status} 
                                        onChange={(e) => setForm({ ...form, status: e.target.value })} 
                                        className="w-full p-2.5 border-[0.5px] border-black/50 rounded-[10px] bg-white outline-none focus:border-black"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t-[0.5px] border-black/50 flex justify-end gap-2">
                            <button 
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 border-[0.5px] border-black/50 text-gray-700 hover:bg-neutral-50 rounded-[10px] text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2 bg-black hover:bg-neutral-900 text-white rounded-[10px] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {saving && <Loader2 className="animate-spin" size={12} />}
                                {saving ? 'Saving...' : 'Commit Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
