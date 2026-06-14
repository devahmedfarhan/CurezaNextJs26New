'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function AdminSellersPage() {
    const [sellers, setSellers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { showToast } = useToast();

    // Pagination & Search & Status Filter states
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalSellers, setTotalSellers] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile_number: '',
        registering_as: 'Brand',
    });

    const fetchSellers = async (page = 1, search = '', status = 'all') => {
        try {
            setIsLoading(true);
            const response = await api.get(`/admin/sellers?page=${page}&search=${search}&status=${status}&per_page=10`);
            
            if (response.data && response.data.data) {
                setSellers(response.data.data);
                setCurrentPage(response.data.current_page || 1);
                setLastPage(response.data.last_page || 1);
                setTotalSellers(response.data.total || 0);
            } else {
                setSellers(response.data || []);
                setCurrentPage(1);
                setLastPage(1);
                setTotalSellers((response.data || []).length);
            }
        } catch (error) {
            console.error('Failed to fetch sellers', error);
            showToast('Failed to load sellers', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers(1, searchQuery, statusFilter);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchSellers(1, searchQuery, statusFilter);
    };

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/admin/sellers/${id}/approve`);
            showToast('Seller approved successfully', 'success');
            fetchSellers(currentPage, searchQuery, statusFilter);
        } catch (error) {
            console.error('Failed to approve seller', error);
            showToast('Failed to approve seller', 'error');
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to reject this seller?')) return;
        try {
            await api.post(`/admin/sellers/${id}/reject`);
            showToast('Seller rejected', 'success');
            fetchSellers(currentPage, searchQuery, statusFilter);
        } catch (error) {
            console.error('Failed to reject seller', error);
            showToast('Failed to reject seller', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this seller? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/sellers/${id}`);
            showToast('Seller deleted successfully', 'success');
            fetchSellers(currentPage, searchQuery, statusFilter);
        } catch (error) {
            console.error('Failed to delete seller', error);
            showToast('Failed to delete seller', 'error');
        }
    };

    const handleCreateSeller = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            alert("To create a full seller profile, please use the public registration form. We are adding a 'Quick Add' feature soon.");
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seller Management</h1>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-1">Configure and clearance approval for registered vendors.</p>
                </div>
                <Link
                    href="/superadmin/dashboard/users/create?type=seller"
                    className="bg-cureza-green text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-150"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add New Seller
                </Link>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1">
                    <input
                        type="text"
                        placeholder="Search sellers by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-bold focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none w-full md:w-80 transition-all placeholder:font-semibold"
                    />
                    <button
                        type="submit"
                        className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-colors"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Filter Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            const newStatus = e.target.value;
                            setStatusFilter(newStatus);
                            setCurrentPage(1);
                            fetchSellers(1, searchQuery, newStatus);
                        }}
                        className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-bold focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none bg-white cursor-pointer w-full md:w-44 transition-all"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Seller Name</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Email</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Products</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Joined Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center py-12 text-xs font-bold text-gray-400 uppercase tracking-wider animate-pulse">Loading dossiers...</td></tr>
                        ) : sellers.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-xs font-bold text-gray-400 uppercase tracking-wider">No sellers found</td></tr>
                        ) : (
                            sellers.map((seller) => (
                                <tr key={seller.id} className="hover:bg-gray-50/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-extrabold text-gray-900">{seller.name}</div>
                                        {seller.profile?.registering_as && (
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-wider">{seller.profile.registering_as}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{seller.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border 
                                            ${seller.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                seller.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {seller.status === 'approved' ? <CheckCircle size={10} /> :
                                                seller.status === 'rejected' ? <XCircle size={10} /> :
                                                    <Clock size={10} />}
                                            {seller.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-500">{seller.products_count}</td>
                                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">{seller.joined_date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2.5">
                                            {seller.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(seller.id)} className="text-emerald-600 hover:text-emerald-800 text-[10px] font-extrabold bg-emerald-50 hover:bg-emerald-100/50 px-2.5 py-1 rounded-lg transition-colors uppercase tracking-wider border border-emerald-100">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleReject(seller.id)} className="text-rose-600 hover:text-rose-800 text-[10px] font-extrabold bg-rose-50 hover:bg-rose-100/50 px-2.5 py-1 rounded-lg transition-colors uppercase tracking-wider border border-rose-100">
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <Link href={`/superadmin/dashboard/users/sellers/${seller.id}`} className="p-1.5 bg-gray-50 hover:bg-gray-150 border border-gray-200 text-gray-500 hover:text-gray-900 rounded-lg transition-colors" title="View details">
                                                <Eye size={14} />
                                            </Link>
                                            <button onClick={() => handleDelete(seller.id)} className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-rose-600 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {lastPage > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-500 font-medium">
                        Showing page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{lastPage}</strong> (Total: {totalSellers} sellers)
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            disabled={currentPage === 1 || isLoading}
                            onClick={() => {
                                const prev = currentPage - 1;
                                setCurrentPage(prev);
                                fetchSellers(prev, searchQuery, statusFilter);
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => {
                            if (p === 1 || p === lastPage || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                return (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            setCurrentPage(p);
                                            fetchSellers(p, searchQuery, statusFilter);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                            currentPage === p
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-650 hover:border-gray-300'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            if (p === 2 || p === lastPage - 1) {
                                return <span key={p} className="text-gray-400 text-xs px-1 select-none">...</span>;
                            }
                            return null;
                        })}

                        <button
                            disabled={currentPage === lastPage || isLoading}
                            onClick={() => {
                                const next = currentPage + 1;
                                setCurrentPage(next);
                                fetchSellers(next, searchQuery, statusFilter);
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-650 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Add Seller Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Seller</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            To create a comprehensive seller profile with documents, please use the
                            <Link href="/seller/register" target="_blank" className="text-cureza-green hover:underline ml-1">
                                Public Registration Form
                            </Link>.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Close
                            </button>
                            <Link
                                href="/seller/register"
                                target="_blank"
                                className="px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700"
                            >
                                Go to Registration Form
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
