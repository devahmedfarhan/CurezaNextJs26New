'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit, Trash2, Tag as TagIcon, CheckSquare, Square, Sparkles, Loader2, Check } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Tag {
    id: number;
    name: string;
    slug: string;
    description: string;
}

export default function AdminTagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();

    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchTags = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/tags');
            setTags(response.data);
            setSelectedIds([]); // Clear selection on refresh
        } catch (error) {
            console.error('Failed to fetch tags', error);
            showToast('Failed to load tags', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleOpenModal = (tag?: Tag) => {
        if (tag) {
            setEditingTag(tag);
            setFormData({
                name: tag.name,
                description: tag.description || ''
            });
        } else {
            setEditingTag(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingTag) {
                await api.put(`/admin/tags/${editingTag.id}`, formData);
                showToast('Tag updated successfully', 'success');
            } else {
                await api.post('/admin/tags', formData);
                showToast('Tag created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchTags();
        } catch (error: any) {
            console.error('Failed to save tag', error);
            showToast(error.response?.data?.message || 'Failed to save tag', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/tags/${id}`);
            showToast('Tag deleted successfully', 'success');
            fetchTags();
        } catch (error) {
            console.error('Failed to delete tag', error);
            showToast('Failed to delete tag', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} tags? This action cannot be undone.`)) return;

        try {
            setIsSubmitting(true);
            await api.post('/admin/tags/bulk-delete', { ids: selectedIds });
            showToast(`${selectedIds.length} tags deleted successfully`, 'success');
            fetchTags();
        } catch (error) {
            console.error('Failed to delete tags', error);
            showToast('Failed to delete tags', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredTags.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTags.map(tag => tag.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-outfit">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-8 border border-neutral-950/15 shadow-none">
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-neutral-100 dark:bg-gray-800 border-[0.5px] border-neutral-950/10 rounded-md text-black dark:text-white">
                                <TagIcon size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
                                Product Tags
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium text-sm">
                            Create and manage search keywords and metadata tags to help customers find products quickly.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                disabled={isSubmitting}
                                className="flex h-11 items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-650 px-5 rounded-md font-bold text-xs capitalize border border-red-200/50 dark:border-red-900/35 transition-all shadow-none"
                            >
                                <Trash2 size={15} />
                                Delete Selected ({selectedIds.length})
                            </button>
                        )}
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex h-11 items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 rounded-md font-bold hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 text-xs capitalize shadow-none cursor-pointer"
                        >
                            <Plus size={16} />
                            Add New Tag
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-neutral-950/15 rounded-md font-bold text-sm text-gray-955 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition-all"
                    placeholder="Search tags by name or slug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tags Table Layout */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border border-neutral-950/15 shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-950/10 dark:divide-gray-800">
                        <thead className="bg-neutral-50 dark:bg-gray-850/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left w-12">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-gray-400 hover:text-black dark:hover:text-white transition-colors outline-none cursor-pointer"
                                    >
                                        {selectedIds.length === filteredTags.length && filteredTags.length > 0 ? (
                                            <CheckSquare className="text-black dark:text-white" size={20} />
                                        ) : (
                                            <Square size={20} />
                                        )}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 capitalize tracking-normal">
                                    Tag Details
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 capitalize tracking-normal">
                                    Slug
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 capitalize tracking-normal">
                                    Description
                                </th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-950/10 dark:divide-gray-850 font-bold text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-450">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={32} className="animate-spin text-black dark:text-white" />
                                            <span className="text-xs font-bold capitalize animate-pulse">Syncing tags registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTags.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-full text-gray-305">
                                                <TagIcon size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-gray-950 dark:text-white">No tags found</p>
                                                <p className="text-sm text-gray-500">Try adjusting your search criteria or register a new tag.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTags.map((tag) => (
                                    <tr
                                        key={tag.id}
                                        className={`hover:bg-neutral-50/50 dark:hover:bg-gray-850/30 transition-colors group ${selectedIds.includes(tag.id) ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleSelect(tag.id)}
                                                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors outline-none cursor-pointer"
                                            >
                                                {selectedIds.includes(tag.id) ? (
                                                    <CheckSquare className="text-black dark:text-white" size={20} />
                                                ) : (
                                                    <Square size={20} />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-gray-800 flex items-center justify-center text-black dark:text-white border-[0.5px] border-neutral-950/10 font-bold text-xs select-none">
                                                    #{tag.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-extrabold text-gray-955 dark:text-gray-100">{tag.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                            <span className="bg-gray-55 dark:bg-gray-800 border border-neutral-950/10 dark:border-gray-700 px-2.5 py-1 rounded text-[10px] font-bold capitalize">/{tag.slug}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-550 dark:text-gray-400 font-medium truncate max-w-xs">{tag.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                                <button 
                                                    onClick={() => handleOpenModal(tag)} 
                                                    className="p-2 text-gray-405 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-800 rounded transition-all" 
                                                    title="Edit Tag"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(tag.id)} 
                                                    className="p-2 text-gray-405 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-all" 
                                                    title="Delete Tag"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Tag Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/65 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-350">
                    <div className="bg-white dark:bg-gray-900 border border-neutral-950/15 rounded-[10px] shadow-none max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 border-b border-neutral-950/10 dark:border-gray-800 flex justify-between items-center bg-neutral-50/50 dark:bg-gray-850/50">
                            <div>
                                <h2 className="font-extrabold text-sm capitalize text-gray-955 dark:text-white">{editingTag ? 'Edit Tag Details' : 'Create New Tag'}</h2>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Fill in the tag fields</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-md bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-neutral-950/15 dark:border-gray-700 shadow-none transition-colors cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 font-semibold text-sm">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider block">Tag Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 border border-neutral-950/15 rounded-md bg-white dark:bg-gray-800/30 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black font-bold text-sm text-gray-955 dark:text-gray-100 transition-all"
                                    placeholder="e.g. Organic, Skin Care, Viral"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider block">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full p-4 border border-neutral-950/15 rounded-md bg-white dark:bg-gray-800/30 focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black font-medium text-sm text-gray-750 dark:text-gray-300 resize-none transition-all leading-relaxed"
                                    rows={4}
                                    placeholder="Briefly describe what this tag is for..."
                                />
                            </div>
                            <div className="pt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-1/2 h-11 text-xs font-bold capitalize border border-neutral-950/15 rounded-md text-gray-750 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-850 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-1/2 h-11 text-xs font-bold capitalize rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center gap-1.5 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all shadow-none"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={14} />
                                            {editingTag ? 'Save Tag' : 'Create Tag'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
