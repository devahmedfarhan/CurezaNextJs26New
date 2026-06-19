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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Store size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cureza-green/10 rounded-2xl text-cureza-green">
                                <Store size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Brands & <span className="text-cureza-green">Sellers</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium">
                            Manage your global directory of active brands, system labels, and assigned merchant profiles.
                        </p>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 bg-cureza-green text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-green-100 dark:shadow-none hover:bg-green-700 transition-all active:scale-95 text-xs uppercase"
                    >
                        <Plus size={18} />
                        Register Brand
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-sm text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                    placeholder="Search brands by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Brands List */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                        <thead className="bg-gray-50/50 dark:bg-gray-850/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Brand Name
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Owner / Vendor
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Description
                                </th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-bold text-sm">
                            {isLoading ? (
                                [1, 2, 3].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full" />
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md w-24" />
                                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-md w-16" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-28" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md w-48" />
                                        </td>
                                        <td className="px-6 py-4" />
                                    </tr>
                                ))
                            ) : filteredBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-full text-gray-300">
                                                <Store size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">No brands found</p>
                                                <p className="text-sm text-gray-500 max-w-xs">Register your first system brand or adjust search queries.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0 bg-cureza-green/10 text-cureza-green rounded-full flex items-center justify-center font-black text-sm uppercase">
                                                    {brand.name.charAt(0)}
                                                </div>
                                                <div className="ml-4 min-w-0">
                                                    <div className="text-gray-950 dark:text-gray-100 truncate max-w-[180px]">{brand.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase pt-0.5">/{brand.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-350">
                                            {brand.user ? (
                                                <div className="text-gray-900 dark:text-gray-100">{brand.user.name}</div>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700">
                                                    System / Admin
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-450 font-medium">
                                            <div className="truncate max-w-xs" title={brand.description}>{brand.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                                <button 
                                                    onClick={() => handleOpenModal(brand)} 
                                                    className="p-2.5 text-gray-400 hover:text-cureza-green hover:bg-green-50 dark:hover:bg-green-950/20 rounded-xl transition-all" 
                                                    title="Edit Brand"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(brand.id)} 
                                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all" 
                                                    title="Delete Brand"
                                                >
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

            {/* Dynamic Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-md overflow-hidden border border-white/20 shadow-2xl">
                        <div className="relative p-8">
                            <button 
                                onClick={() => setIsModalOpen(false)}
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
                                        {editingBrand ? 'Edit Brand' : 'Register Brand'}
                                    </h2>
                                    <p className="text-xs font-bold text-gray-400 tracking-wider pt-1 uppercase">Directory Record</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Brand Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-cureza-green focus:bg-white dark:focus:bg-gray-900 transition-all px-6 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300"
                                        placeholder="e.g. Organic India, Dabur"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-cureza-green focus:bg-white dark:focus:bg-gray-900 transition-all px-6 py-4 font-semibold text-gray-800 dark:text-gray-200 placeholder:text-gray-300"
                                        rows={3}
                                        placeholder="Optional description of the brand identity..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-8 py-5 rounded-3xl font-black shadow-xl hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 text-sm uppercase tracking-wider"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                {editingBrand ? 'COMMIT CHANGES' : 'CREATE RECORD'}
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
