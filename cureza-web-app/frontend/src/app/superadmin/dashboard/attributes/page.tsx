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
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cureza-green/10 rounded-2xl text-cureza-green">
                                <Settings2 size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Product <span className="text-cureza-green">Attributes</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium">
                            Configure global product properties like size, color, and weight to power your store&apos;s filtration and variant systems.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 bg-cureza-green text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-700 transition-all active:scale-95 text-sm"
                    >
                        <Plus size={20} />
                        CREATE NEW ATTRIBUTE
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="animate-spin text-cureza-green" size={40} />
                    <p className="text-sm font-bold text-gray-400 animate-pulse">SYNCHRONIZING ATTRIBUTES...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attributes.map((attr) => (
                        <div key={attr.id} className="group bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-cureza-green/20 transition-all duration-300">
                            <div className="flex items-start justify-between mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none uppercase">
                                            {attr.name}
                                        </h3>
                                        <div className={`w-2 h-2 rounded-full ${attr.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-cureza-green/10 group-hover:text-cureza-green transition-colors">
                                        Type: {attr.type}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditModal(attr)}
                                        className="p-2.5 text-gray-400 hover:text-cureza-green hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-all"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(attr.id)}
                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6 h-[72px] overflow-hidden">
                                <div className="flex flex-wrap gap-2">
                                    {attr.terms?.length > 0 ? (
                                        <>
                                            {attr.terms.slice(0, 6).map((term: any) => (
                                                <div
                                                    key={term.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300"
                                                >
                                                    {attr.type === 'color' && term.value && (
                                                        <div className="w-2.5 h-2.5 rounded-full border border-black/5 shadow-sm" style={{ backgroundColor: term.value }} />
                                                    )}
                                                    {term.name}
                                                </div>
                                            ))}
                                            {attr.terms.length > 6 && (
                                                <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-[10px] font-black text-gray-400 uppercase">
                                                    +{attr.terms.length - 6} MORE
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-300 italic text-xs font-medium">
                                            <AlertCircle size={14} />
                                            No terms configured yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Link
                                href={`/superadmin/dashboard/attributes/${attr.id}`}
                                className="group/btn flex items-center justify-between w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl hover:bg-cureza-green hover:text-white transition-all duration-300 font-black text-xs tracking-widest uppercase"
                            >
                                Manage Terms
                                <ChevronRight size={18} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}

                    {attributes.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center shadow-lg text-gray-200">
                                <Settings2 size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">SYSTEM READY</h3>
                                <p className="text-gray-400 text-sm font-medium">No attributes found. Start by creating a new category property.</p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="text-cureza-green font-black text-sm uppercase tracking-widest hover:underline pt-2"
                            >
                                + INITIALIZE FIRST ATTRIBUTE
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Premium Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-lg overflow-hidden border border-white/20 shadow-2xl">
                        <div className="relative p-8">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-cureza-green/10 rounded-2xl text-cureza-green">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">
                                        {isEditing ? 'EDIT' : 'NEW'} ATTRIBUTE
                                    </h2>
                                    <p className="text-xs font-bold text-gray-400 tracking-wider pt-1 uppercase">CONFIGURE GLOBAL PROPERTY</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Attribute Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-cureza-green focus:bg-white dark:focus:bg-gray-900 transition-all px-6 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                                        placeholder="e.g. SIZE, MATERIAL, COLOR"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Control Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['select', 'button', 'color'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type })}
                                                className={`py-6 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${formData.type === type
                                                        ? 'border-cureza-green bg-green-50 dark:bg-green-900/10 text-cureza-green shadow-sm'
                                                        : 'border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-400'
                                                    }`}
                                            >
                                                {type === 'select' && 'Dropdown'}
                                                {type === 'button' && 'Swatches'}
                                                {type === 'color' && 'Visual Color'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Active Visibility</p>
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Enable this across the store</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.is_active ? 'bg-cureza-green' : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                    </button>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-8 py-5 rounded-3xl font-black shadow-xl hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 text-sm italic"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Check size={20} />
                                                {isEditing ? 'COMMIT UPDATES' : 'SAVE ATTRIBUTE'}
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
