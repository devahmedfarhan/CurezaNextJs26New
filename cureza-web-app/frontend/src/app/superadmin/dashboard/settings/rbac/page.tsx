'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface AdminRole {
    id: number;
    name: string;
    slug: string;
    permissions: string[];
    users_count: number;
    created_at: string;
}

const AVAILABLE_MODULES = [
    { id: 'dashboard', name: 'Dashboard Overview', desc: 'Access to dashboard statistics, analytics charts, and system reports' },
    { id: 'products', name: 'Products & Catalog', desc: 'Manage products, categories, brands, tags, and web scraper scraper tasks' },
    { id: 'orders', name: 'Orders & Refunds', desc: 'View and manage customer orders, refunds, and shipments' },
    { id: 'reviews', name: 'Ratings & Reviews', desc: 'Moderate and reply to product reviews and doctor reviews' },
    { id: 'users', name: 'User Management', desc: 'View lists and details of customers, sellers, doctors, and team members' },
    { id: 'approvals', name: 'Approvals', desc: 'Approve seller registrations and store profile change requests' },
    { id: 'marketing', name: 'Marketing & Promos', desc: 'Manage discount coupons, offers, campaigns, and pixel tracking settings' },
    { id: 'events', name: 'Events', desc: 'Create and coordinate public events and health webinars' },
    { id: 'finance', name: 'Finance & Payouts', desc: 'Access payouts, transactions, and commission settings' },
    { id: 'support', name: 'Support & Tickets', desc: 'Manage customer, seller, and doctor support tickets' },
    { id: 'community', name: 'Cureza Circle', desc: 'Manage referrals, leaderboards, challenges, and rewards shop items' },
    { id: 'cms', name: 'CMS & Blogs', desc: 'Access homepage banners, FAQ listings, and blog posts management' },
    { id: 'settings', name: 'Global Settings', desc: 'Access shipping options, payment gateways, legal policies, and system settings' },
];

export default function AdminRBACPage() {
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        permissions: [] as string[]
    });

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles', error);
            showToast('Failed to load roles', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenModal = (role?: AdminRole) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                permissions: role.permissions
            });
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                permissions: []
            });
        }
        setIsModalOpen(true);
    };

    const handlePermissionToggle = (moduleId: string) => {
        setFormData(prev => {
            const hasPermission = prev.permissions.includes(moduleId);
            const newPermissions = hasPermission
                ? prev.permissions.filter(p => p !== moduleId)
                : [...prev.permissions, moduleId];
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSelectAllPermissions = () => {
        const allIds = AVAILABLE_MODULES.map(m => m.id);
        const isAllSelected = formData.permissions.length === allIds.length;
        setFormData(prev => ({
            ...prev,
            permissions: isAllSelected ? [] : allIds
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showToast('Please enter a role name', 'error');
            return;
        }
        if (formData.permissions.length === 0) {
            showToast('Please select at least one permission module', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingRole) {
                await api.put(`/admin/roles/${editingRole.id}`, formData);
                showToast('Role updated successfully', 'success');
            } else {
                await api.post('/admin/roles', formData);
                showToast('Role created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchRoles();
        } catch (error: any) {
            console.error('Failed to save role', error);
            showToast(error.response?.data?.message || 'Failed to save role', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/roles/${id}`);
            showToast('Role deleted successfully', 'success');
            fetchRoles();
        } catch (error: any) {
            console.error('Failed to delete role', error);
            showToast(error.response?.data?.message || 'Failed to delete role', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="text-cureza-green" />
                        Role-Based Access Control
                    </h1>
                    <p className="text-gray-500 mt-1">Manage admin roles and assign system module permissions</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-cureza-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-750 transition-all shadow-sm hover:shadow-md font-medium"
                >
                    <Plus size={18} />
                    Create New Role
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-xl border border-gray-200 shadow-sm">
                    Loading admin roles...
                </div>
            ) : roles.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-xl border border-gray-200 shadow-sm">
                    No roles found. Create one to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                        <div key={role.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-50 text-cureza-green rounded-lg shadow-inner">
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{role.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                <Users size={14} /> {role.users_count} Admins Assigned
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(role)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Role"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Role"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg mt-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Permissions ({role.permissions.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.permissions.map((perm) => {
                                            const module = AVAILABLE_MODULES.find(m => m.id === perm);
                                            return (
                                                <span key={perm} className="px-2.5 py-1 bg-white text-gray-800 border border-gray-200 rounded-md text-xs font-medium shadow-sm">
                                                    {module ? module.name : perm}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-gray-150 flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <Shield className="text-cureza-green" size={20} />
                                {editingRole ? 'Edit Admin Role' : 'Create New Admin Role'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-650 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. Customer Support Agent, Order Manager"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/50 focus:border-cureza-green text-sm shadow-sm transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <label className="block text-sm font-semibold text-gray-700">Assign Modules & Permissions</label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllPermissions}
                                            className="text-xs font-bold text-cureza-green hover:text-green-700 transition-colors"
                                        >
                                            {formData.permissions.length === AVAILABLE_MODULES.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {AVAILABLE_MODULES.map((mod) => {
                                            const isSelected = formData.permissions.includes(mod.id);
                                            return (
                                                <div
                                                    key={mod.id}
                                                    onClick={() => handlePermissionToggle(mod.id)}
                                                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                                        isSelected
                                                            ? 'border-cureza-green bg-green-50/20 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                >
                                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? 'bg-cureza-green border-cureza-green text-white'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-900">{mod.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 leading-normal">{mod.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-gray-150 bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-950 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-cureza-green text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {isSubmitting ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
