'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit, Trash2, Store, Loader2, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string;
    user?: {
        name: string;
        email: string;
    };
}

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data);
        } catch (error) {
            console.error('Failed to fetch brands', error);
            showToast('Failed to load brands', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleOpenModal = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                description: brand.description || ''
            });
        } else {
            setEditingBrand(null);
            setFormData({
                name: '',
                description: ''
            });
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
            if (editingBrand) {
                await api.put(`/admin/brands/${editingBrand.id}`, formData);
                showToast('Brand updated successfully', 'success');
            } else {
                await api.post('/admin/brands', formData);
                showToast('Brand created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchBrands();
        } catch (error: any) {
            console.error('Failed to save brand', error);
            showToast(error.response?.data?.message || 'Failed to save brand', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/brands/${id}`);
            showToast('Brand deleted successfully', 'success');
            fetchBrands();
        } catch (error: any) {
            console.error('Failed to delete brand', error);
            showToast(error.response?.data?.message || 'Failed to delete brand', 'error');
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-black/50 dark:border-gray-800">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Store size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                <Store size={20} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Brands & Sellers
                            </h1>
                        </div>
                        <p className="text-gray-550 dark:text-gray-400 max-w-xl font-normal text-xs">
                            Manage your global directory of active brands, system labels, and assigned merchant profiles.
                        </p>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-[10px] font-semibold hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 text-xs"
                    >
                        <Plus size={18} />
                        Register Brand
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    className="w-full h-10 pl-10 pr-4 bg-white dark:bg-gray-900 border-[0.5px] border-black/50 rounded-lg text-xs font-normal text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                    placeholder="Search brands by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Brands List */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-955/10 dark:divide-gray-800">
                        <thead className="bg-neutral-50/50 dark:bg-gray-850/50">
                            <tr className="font-semibold text-xs text-gray-500 tracking-wider">
                                <th scope="col" className="px-6 py-3.5 text-left">
                                    Brand Name
                                </th>
                                <th scope="col" className="px-6 py-3.5 text-left">
                                    Owner / Vendor
                                </th>
                                <th scope="col" className="px-6 py-3.5 text-left">
                                    Description
                                </th>
                                <th scope="col" className="relative px-6 py-3.5">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-955/5 dark:divide-gray-850 font-semibold text-sm">
                            {isLoading ? (
                                [1, 2, 3].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-neutral-100 dark:bg-gray-800 rounded-full" />
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="h-3 bg-neutral-100 dark:bg-gray-800 rounded-md w-24" />
                                                    <div className="h-2.5 bg-neutral-100 dark:bg-gray-800 rounded-md w-16" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-neutral-100 dark:bg-gray-800 rounded-md w-28" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-neutral-100 dark:bg-gray-800 rounded-md w-48" />
                                        </td>
                                        <td className="px-6 py-4" />
                                    </tr>
                                ))
                            ) : filteredBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-neutral-50 dark:bg-gray-850 rounded-full text-gray-300">
                                                <Store size={36} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">No brands found</p>
                                                <p className="text-xs text-gray-500 max-w-xs">Register your first system brand or adjust search queries.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-neutral-50/40 dark:hover:bg-gray-850/20 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0 bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white rounded-full flex items-center justify-center font-bold text-sm border-[0.5px] border-black/50">
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4 min-w-0">
                                                    <div className="text-gray-950 dark:text-gray-100 font-bold truncate max-w-[180px]">{brand.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-semibold tracking-wider pt-0.5">/{brand.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-350">
                                            {brand.user ? (
                                                <div className="text-gray-900 dark:text-gray-100">{brand.user.name}</div>
                                            ) : (
                                                <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider rounded-lg bg-neutral-50 dark:bg-gray-800 text-gray-450 border-[0.5px] border-black/50">
                                                    System / Admin
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-505 dark:text-gray-450 font-normal">
                                            <div className="truncate max-w-xs text-xs" title={brand.description}>{brand.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 transition-transform">
                                                <button 
                                                    onClick={() => handleOpenModal(brand)} 
                                                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-all" 
                                                    title="Edit Brand"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(brand.id)} 
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all" 
                                                    title="Delete Brand"
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

            {/* Dynamic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] w-full max-w-md overflow-hidden border-[0.5px] border-black/50">
                        <div className="relative p-6">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-950 dark:text-white leading-none">
                                        {editingBrand ? 'Edit Brand' : 'Register Brand'}
                                    </h2>
                                    <p className="text-[10px] font-semibold text-gray-400 tracking-wider pt-1 uppercase">Directory Record</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-gray-500 tracking-wider block px-1">Brand Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3.5 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-900 dark:text-white transition-all"
                                        placeholder="e.g. Organic India, Dabur"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-gray-500 tracking-wider block px-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full p-3.5 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-normal text-gray-750 dark:text-gray-300 resize-none transition-all leading-relaxed"
                                        rows={3}
                                        placeholder="Optional description of the brand identity..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-lg font-semibold hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all text-xs"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <>
                                                {editingBrand ? 'Commit Changes' : 'Create Record'}
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
