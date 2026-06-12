'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit, Trash2, Tag as TagIcon, CheckSquare, Square } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TagIcon size={28} className="text-cureza-green" />
                        Tags Management
                    </h1>
                    <p className="text-gray-500">Create and manage product tags</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-bold border border-red-200"
                        >
                            <Trash2 size={18} />
                            Delete Selected ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold shadow-lg shadow-green-100"
                    >
                        <Plus size={18} />
                        Add New Tag
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-cureza-green focus:border-transparent sm:text-sm transition-all"
                        placeholder="Search tags by name or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tags List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left w-10">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="text-gray-400 hover:text-cureza-green transition-colors"
                                    >
                                        {selectedIds.length === filteredTags.length && filteredTags.length > 0 ? (
                                            <CheckSquare className="text-cureza-green" size={20} />
                                        ) : (
                                            <Square size={20} />
                                        )}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Tag Details
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Slug
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Description
                                </th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 border-4 border-gray-100 border-t-cureza-green rounded-full animate-spin" />
                                            <span className="text-sm font-medium">Fetching tags...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTags.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <TagIcon size={40} className="text-gray-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-gray-900">No tags found</p>
                                                <p className="text-sm text-gray-500">Try adjusting your search or add a new tag.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTags.map((tag) => (
                                    <tr
                                        key={tag.id}
                                        className={`hover:bg-gray-50/50 transition-colors ${selectedIds.includes(tag.id) ? 'bg-green-50/30' : ''}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleSelect(tag.id)}
                                                className="text-gray-400 hover:text-cureza-green transition-colors"
                                            >
                                                {selectedIds.includes(tag.id) ? (
                                                    <CheckSquare className="text-cureza-green" size={20} />
                                                ) : (
                                                    <Square size={20} />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-cureza-green font-bold text-xs">
                                                    #{tag.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">{tag.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-[11px] font-bold">/{tag.slug}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 font-medium truncate max-w-xs">{tag.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(tag)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Tag">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(tag.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Tag">
                                                    <Trash2 size={18} />
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="font-black text-xl text-gray-900">{editingTag ? 'Edit Tag' : 'Create New Tag'}</h2>
                                <p className="text-xs text-gray-500 font-medium">Fill in the details below to save your tag.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase tracking-widest pl-1">Tag Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-cureza-green focus:ring-0 transition-all font-bold text-gray-900"
                                    placeholder="e.g. Organic, Skin Care, Viral"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-700 uppercase tracking-widest pl-1">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-cureza-green focus:ring-0 transition-all font-medium text-gray-700"
                                    rows={4}
                                    placeholder="Briefly describe what this tag is for..."
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-cureza-green text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 disabled:opacity-50 shadow-xl shadow-green-100 transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    {isSubmitting ? 'Processing...' : (editingTag ? 'Update Tag' : 'Create Tag')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
