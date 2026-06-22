'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Sparkles, AlertCircle, Loader2, Check, Palette, Hash } from 'lucide-react';
import api from '@/lib/api';

export default function AttributeTermsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [attribute, setAttribute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editingTerm, setEditingTerm] = useState<number | null>(null);
    const [newTerm, setNewTerm] = useState({ name: '', value: '' });
    const [editData, setEditData] = useState({ name: '', value: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAttribute();
        }
    }, [id]);

    const fetchAttribute = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/attributes/${id}`);
            setAttribute(res.data);
        } catch (error) {
            console.error('Failed to fetch attribute', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTerm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post(`/admin/attributes/${id}/terms`, newTerm);
            setNewTerm({ name: '', value: '' });
            fetchAttribute();
        } catch (error) {
            console.error('Failed to add term', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTerm = async (termId: number) => {
        try {
            await api.put(`/admin/attributes/${id}/terms/${termId}`, editData);
            setEditingTerm(null);
            fetchAttribute();
        } catch (error) {
            console.error('Failed to update term', error);
        }
    };

    const handleDeleteTerm = async (termId: number) => {
        if (!confirm('Are you sure you want to delete this term?')) return;
        try {
            await api.delete(`/admin/attributes/${id}/terms/${termId}`);
            fetchAttribute();
        } catch (error) {
            console.error('Failed to delete term', error);
        }
    };

    const startEdit = (term: any) => {
        setEditingTerm(term.id);
        setEditData({ name: term.name, value: term.value || '' });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <Loader2 className="animate-spin text-neutral-900 dark:text-white" size={32} />
            <p className="text-xs font-semibold text-neutral-400 animate-pulse">Fetching configuration...</p>
        </div>
    );

    if (!attribute) return (
        <div className="w-full p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-lg border-[0.5px] border-black/50 dark:border-red-900/20">
            <AlertCircle size={36} className="mx-auto text-red-500 mb-3" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-1">Critical Error</h2>
            <p className="text-xs font-normal text-gray-500 dark:text-gray-400">The requested attribute configuration could not be synchronized.</p>
            <button onClick={() => router.back()} className="mt-4 text-neutral-950 dark:text-white font-semibold text-xs hover:underline flex items-center justify-center gap-1.5 mx-auto">
                <ArrowLeft size={14} /> Return to System
            </button>
        </div>
    );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b-[0.5px] border-black/50 dark:border-neutral-800 pb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white dark:bg-gray-900 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all active:scale-95"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                {attribute.name}
                            </h1>
                            <div className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-semibold rounded border-[0.5px] border-black/50 dark:border-neutral-700 capitalize">
                                {attribute.type}
                            </div>
                        </div>
                        <p className="text-xs font-normal text-neutral-400 pt-1">
                            Configuration detail • {attribute.terms?.length || 0} terms active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 p-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-[0.5px] border-black/50 dark:border-neutral-700">
                    <div className="flex -space-x-1.5 px-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-[0.5px] border-white dark:border-gray-900 bg-neutral-200" />
                        ))}
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-400 pr-2">Global Property</span>
                </div>
            </div>            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Side */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-lg border-[0.5px] border-black/50 dark:border-neutral-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-105 transition-transform">
                            <Plus size={60} />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Add New Value</h2>
                        <form onSubmit={handleAddTerm} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-500 px-0.5">Value Label</label>
                                <input
                                    type="text"
                                    required
                                    value={newTerm.name}
                                    onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-850 rounded-md border-[0.5px] border-black/50 dark:border-neutral-700 focus:border-neutral-950 focus:bg-white dark:focus:bg-gray-900 transition-all px-3 py-2 text-sm font-normal text-neutral-900 dark:text-white placeholder:text-neutral-400"
                                    placeholder="e.g. 10ml, Red, Large"
                                />
                            </div>

                            {attribute.type === 'color' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-neutral-500 px-0.5">Visual Code</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                            <div className="w-3.5 h-3.5 rounded border-[0.5px] border-black/10 shadow-none" style={{ backgroundColor: newTerm.value || '#000000' }} />
                                            <span className="text-neutral-400 font-semibold text-xs">#</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={newTerm.value.replace('#', '')}
                                            onChange={(e) => setNewTerm({ ...newTerm, value: '#' + e.target.value.replace('#', '') })}
                                            className="w-full bg-neutral-50 dark:bg-neutral-850 rounded-md border-[0.5px] border-black/50 dark:border-neutral-700 focus:border-neutral-950 focus:bg-white dark:focus:bg-gray-900 transition-all pl-10 pr-3 py-2 text-sm font-normal text-neutral-900 dark:text-white placeholder:text-neutral-400"
                                            placeholder="000000"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-1.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 text-xs"
                            >
                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Inject Value</>}
                            </button>
                        </form>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-850 p-5 rounded-lg border-[0.5px] border-black/50 dark:border-neutral-800 text-center relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 p-3 opacity-5">
                            <Sparkles size={60} />
                        </div>
                        <h3 className="text-xs font-semibold mb-1">Pro Tip</h3>
                        <p className="text-[11px] font-normal text-neutral-500 leading-relaxed italic">
                            These values will automatically synchronize with your product variant selector. Use consistent naming conventions.
                        </p>
                    </div>
                </div>

                {/* List Side */}
                <div className="lg:col-span-7 space-y-3 font-normal">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-semibold text-neutral-550">Active Schema Values</h2>
                        <div className="text-[9px] font-semibold text-neutral-600 bg-neutral-100 dark:bg-neutral-805 px-2 py-0.5 rounded border-[0.5px] border-black/50 dark:border-neutral-700">Synced</div>
                    </div>

                    <div className="space-y-2">
                        {attribute.terms && attribute.terms.length > 0 ? (
                            attribute.terms.map((term: any) => (
                                <div key={term.id} className="group bg-white dark:bg-gray-900 p-3.5 rounded-lg border-[0.5px] border-black/50 dark:border-neutral-800 hover:border-neutral-300 transition-all duration-200">
                                    {editingTerm === term.id ? (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    className="flex-1 bg-neutral-50 dark:bg-neutral-850 rounded-md border-[0.5px] border-black/50 dark:border-neutral-700 focus:border-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-white"
                                                />
                                                {attribute.type === 'color' && (
                                                    <input
                                                        type="text"
                                                        value={editData.value}
                                                        onChange={(e) => setEditData({ ...editData, value: e.target.value })}
                                                        className="w-28 bg-neutral-50 dark:bg-neutral-850 rounded-md border-[0.5px] border-black/50 dark:border-neutral-700 focus:border-neutral-950 px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-white"
                                                        placeholder="#000000"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => setEditingTerm(null)}
                                                    className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 hover:text-neutral-900 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateTerm(term.id)}
                                                    className="px-4 py-1.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-md text-[10px] font-semibold flex items-center gap-1.5"
                                                >
                                                    <Check size={12} /> Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative group/color">
                                                    {attribute.type === 'color' ? (
                                                        <div
                                                            className="w-8 h-8 rounded-md border-[0.5px] border-black/10 shadow-none transition-transform group-hover:scale-105"
                                                            style={{ backgroundColor: term.value || '#000000' }}
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-md bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-450 border-[0.5px] border-black/50 dark:border-neutral-700">
                                                            <Hash size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
                                                        {term.name}
                                                    </p>
                                                    {term.value && attribute.type === 'color' && (
                                                        <p className="text-[10px] font-medium text-neutral-400">{term.value}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(term)}
                                                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-md transition-all"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTerm(term.id)}
                                                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center space-y-3">
                                <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-full w-fit mx-auto text-neutral-300">
                                    <Palette size={24} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-neutral-400">Empty Namespace</p>
                                    <p className="text-[10px] font-normal text-neutral-350 italic">Configure your first value on the left panel</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
