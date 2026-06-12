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
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="animate-spin text-cureza-green" size={40} />
            <p className="text-xs font-black text-gray-400 tracking-widest uppercase">Fetching configuration...</p>
        </div>
    );

    if (!attribute) return (
        <div className="max-w-4xl mx-auto p-12 text-center bg-red-50 dark:bg-red-900/10 rounded-[32px] border border-red-100 dark:border-red-900/20">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase leading-none mb-2">CRITICAL ERROR</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">The requested attribute configuration could not be synchronized.</p>
            <button onClick={() => router.back()} className="mt-6 text-cureza-green font-black text-sm uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto">
                <ArrowLeft size={16} /> RETURN TO SYSTEM
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between border-b border-gray-100 dark:border-gray-800 pb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-cureza-green hover:shadow-lg transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                {attribute.name}
                            </h1>
                            <div className="px-2 py-1 bg-cureza-green text-white text-[10px] font-black rounded uppercase tracking-widest">
                                {attribute.type}
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-400 tracking-wide pt-1 uppercase">
                            Configuration Detail • {attribute.terms?.length || 0} Terms Active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex -space-x-2 px-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200" />
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-4">Global Property</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Side */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Plus size={80} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-none">ADD NEW VALUE</h2>
                        <form onSubmit={handleAddTerm} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Value Label</label>
                                <input
                                    type="text"
                                    required
                                    value={newTerm.name}
                                    onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-cureza-green focus:bg-white dark:focus:bg-gray-900 transition-all px-6 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                                    placeholder="e.g. 10ML, RED, LARGE"
                                />
                            </div>

                            {attribute.type === 'color' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Visual Code</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                            <div className="w-4 h-4 rounded shadow-sm border border-black/10" style={{ backgroundColor: newTerm.value || '#000000' }} />
                                            <span className="text-gray-400 font-bold">#</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={newTerm.value.replace('#', '')}
                                            onChange={(e) => setNewTerm({ ...newTerm, value: '#' + e.target.value.replace('#', '') })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-cureza-green focus:bg-white dark:focus:bg-gray-900 transition-all pl-16 pr-6 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                                            placeholder="000000"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-3 bg-cureza-green text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 text-sm uppercase"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> INJECT VALUE</>}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-900 dark:bg-white p-8 rounded-[32px] text-white dark:text-gray-900 text-center relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 p-4 opacity-10">
                            <Sparkles size={100} />
                        </div>
                        <h3 className="text-lg font-black uppercase mb-1">PRO TIP</h3>
                        <p className="text-xs font-medium opacity-60 leading-relaxed italic">
                            These values will automatically synchronize with your product variant selector. Use consistent naming conventions.
                        </p>
                    </div>
                </div>

                {/* List Side */}
                <div className="lg:col-span-7 space-y-4 font-bold">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Active Schema Values</h2>
                        <div className="text-[10px] font-black text-cureza-green uppercase bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded">SYNCED</div>
                    </div>

                    <div className="space-y-3">
                        {attribute.terms && attribute.terms.length > 0 ? (
                            attribute.terms.map((term: any) => (
                                <div key={term.id} className="group bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-cureza-green/20 transition-all duration-300">
                                    {editingTerm === term.id ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-transparent focus:border-cureza-green px-4 py-3 font-bold text-gray-900 dark:text-white"
                                                />
                                                {attribute.type === 'color' && (
                                                    <input
                                                        type="text"
                                                        value={editData.value}
                                                        onChange={(e) => setEditData({ ...editData, value: e.target.value })}
                                                        className="w-32 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-transparent focus:border-cureza-green px-4 py-3 font-bold text-gray-900 dark:text-white"
                                                        placeholder="#000000"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => setEditingTerm(null)}
                                                    className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 transition-colors"
                                                >
                                                    CANCEL
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateTerm(term.id)}
                                                    className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                                                >
                                                    <Check size={14} /> SAVE CHANGES
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative group/color">
                                                    {attribute.type === 'color' ? (
                                                        <div
                                                            className="w-12 h-12 rounded-2xl border-4 border-white dark:border-gray-800 shadow-md transform rotate-3 transition-transform group-hover:rotate-12"
                                                            style={{ backgroundColor: term.value || '#000000' }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-cureza-green transition-colors">
                                                            <Hash size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">
                                                        {term.name}
                                                    </p>
                                                    {term.value && attribute.type === 'color' && (
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{term.value}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                                <button
                                                    onClick={() => startEdit(term)}
                                                    className="p-3 text-gray-400 hover:text-cureza-green hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTerm(term.id)}
                                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full w-fit mx-auto text-gray-200">
                                    <Palette size={40} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-gray-400 uppercase">Empty Namespace</p>
                                    <p className="text-[10px] font-medium text-gray-300 uppercase italic">Configure your first value on the left panel</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
