'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, Loader2, Sparkles, Filter, Settings2, X, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AttributesPage() {
    const router = useRouter();
    const [attributes, setAttributes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'select',
        is_active: true,
        sort_order: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/attributes');
            setAttributes(res.data);
        } catch (error) {
            console.error('Failed to fetch attributes', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({ name: '', type: 'select', is_active: true, sort_order: 0 });
        setShowModal(true);
    };

    const openEditModal = (attr: any) => {
        setIsEditing(true);
        setCurrentId(attr.id);
        setFormData({
            name: attr.name,
            type: attr.type,
            is_active: attr.is_active,
            sort_order: attr.sort_order
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing && currentId) {
                await api.put(`/admin/attributes/${currentId}`, formData);
            } else {
                await api.post('/admin/attributes', formData);
            }
            setShowModal(false);
            fetchAttributes();
        } catch (error) {
            console.error('Failed to save attribute', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This will delete all terms associated with this attribute.')) return;
        try {
            await api.delete(`/admin/attributes/${id}`);
            fetchAttributes();
        } catch (error) {
            console.error('Failed to delete attribute', error);
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-lg p-6 border border-neutral-200 dark:border-neutral-800">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Sparkles size={80} />
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100">
                                <Settings2 size={18} />
                            </div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                                Product Attributes
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-normal text-xs">
                            Configure global product properties like size, color, and weight to power your store&apos;s filtration and variant systems.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-1.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95 text-xs"
                    >
                        <Plus size={16} />
                        Create New Attribute
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3">
                    <Loader2 className="animate-spin text-neutral-900 dark:text-white" size={32} />
                    <p className="text-xs font-semibold text-neutral-500 animate-pulse">Synchronizing Attributes...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attributes.map((attr) => (
                        <div key={attr.id} className="group bg-white dark:bg-gray-900 rounded-lg p-5 border border-neutral-200 dark:border-neutral-800 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
                                            {attr.name}
                                        </h3>
                                        <div className={`w-1.5 h-1.5 rounded-full ${attr.is_active ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                                    </div>
                                    <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-50 dark:bg-neutral-850 text-neutral-500 border border-neutral-200/60 dark:border-neutral-700">
                                        Type: <span className="capitalize ml-0.5">{attr.type}</span>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    <button
                                        onClick={() => openEditModal(attr)}
                                        className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(attr.id)}
                                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4 h-[60px] overflow-hidden">
                                <div className="flex flex-wrap gap-1.5">
                                    {attr.terms?.length > 0 ? (
                                        <>
                                            {attr.terms.slice(0, 6).map((term: any) => (
                                                <div
                                                    key={term.id}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-[11px] font-medium text-neutral-600 dark:text-neutral-300"
                                                >
                                                    {attr.type === 'color' && term.value && (
                                                        <div className="w-2 h-2 rounded-full border border-black/5" style={{ backgroundColor: term.value }} />
                                                    )}
                                                    {term.name}
                                                </div>
                                            ))}
                                            {attr.terms.length > 6 && (
                                                <div className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-md text-[9px] font-semibold text-neutral-500 uppercase">
                                                    +{attr.terms.length - 6} more
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-neutral-400 italic text-xs font-normal">
                                            <AlertCircle size={12} />
                                            No terms configured yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Link
                                href={`/superadmin/dashboard/attributes/${attr.id}`}
                                className="group/btn flex items-center justify-between w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 border border-neutral-200 dark:border-neutral-700 transition-all duration-200 font-semibold text-xs"
                            >
                                <span>Manage Terms</span>
                                <ChevronRight size={14} className="translate-x-0 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    ))}

                    {attributes.length === 0 && (
                        <div className="col-span-full py-16 bg-neutral-50/50 dark:bg-neutral-800/10 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center border border-neutral-200 dark:border-neutral-800 text-neutral-400">
                                <Settings2 size={24} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">System Ready</h3>
                                <p className="text-neutral-400 text-xs font-normal">No attributes found. Start by creating a new category property.</p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="text-neutral-950 dark:text-white font-semibold text-xs hover:underline pt-1.5"
                            >
                                + Initialize First Attribute
                            </button>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md overflow-hidden border border-neutral-200 dark:border-neutral-800">
                        <div className="relative p-5">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-md transition-all"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                                        {isEditing ? 'Edit Attribute' : 'New Attribute'}
                                    </h2>
                                    <p className="text-[10px] font-normal text-neutral-400">Configure global product properties</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-neutral-500 px-0.5">Attribute Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-850 rounded-md border border-neutral-200 dark:border-neutral-700 focus:border-neutral-950 dark:focus:border-white focus:bg-white dark:focus:bg-gray-900 transition-all px-3 py-2 text-sm font-normal text-neutral-900 dark:text-white placeholder:text-neutral-400"
                                        placeholder="e.g. Size, Material, Color"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-500 px-0.5">Control Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['select', 'button', 'color'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type })}
                                                className={`py-2 rounded-md border text-xs font-semibold transition-all ${formData.type === type
                                                        ? 'border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                                                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 text-neutral-500'
                                                    }`}
                                            >
                                                {type === 'select' && 'Dropdown'}
                                                {type === 'button' && 'Swatches'}
                                                {type === 'color' && 'Visual Color'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-850 rounded-md border border-neutral-200 dark:border-neutral-800">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold text-neutral-950 dark:text-white">Active Visibility</p>
                                        <p className="text-[10px] font-normal text-neutral-400">Enable this across the store</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-11 h-6 rounded-full transition-all flex items-center px-0.5 ${formData.is_active ? 'bg-neutral-950 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200/50 shadow-sm transition-all transform ${formData.is_active ? 'translate-x-5' : 'translate-x-0'
                                            }`} />
                                    </button>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-4 py-2.5 rounded-md font-semibold hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 disabled:opacity-50 text-xs"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Check size={14} />
                                                {isEditing ? 'Commit Updates' : 'Save Attribute'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
