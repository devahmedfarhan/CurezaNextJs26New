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
        <div className="w-full space-y-6 pb-20 font-sans text-neutral-900">
            <div className="flex justify-between items-center border-b border-black/10 pb-5">
                <div>
                    <h2 className="text-sm font-medium text-neutral-900 tracking-tight">Role-Based Access Control</h2>
                    <p className="text-neutral-500 text-xs mt-0.5">Manage admin roles and assign system module permissions</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-4 py-2 rounded-[10px] flex items-center gap-2 hover:bg-neutral-900 transition-all font-medium text-xs shadow-none shrink-0"
                >
                    <Plus size={14} />
                    Create New Role
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-neutral-500 text-xs font-normal bg-white rounded-[10px] border border-black/10 shadow-none">
                    Loading admin roles...
                </div>
            ) : roles.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 text-xs font-normal bg-white rounded-[10px] border border-black/10 shadow-none">
                    No roles found. Create one to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map((role) => (
                        <div key={role.id} className="bg-white p-5 rounded-[10px] border border-black/10 shadow-none hover:border-black/30 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-neutral-50 text-black border border-black/10 rounded-[10px] shadow-none">
                                            <Shield size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-neutral-900 text-sm">{role.name}</h3>
                                            <p className="text-xs text-neutral-450 flex items-center gap-1.5 mt-0.5">
                                                <Users size={12} /> {role.users_count} Admins Assigned
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleOpenModal(role)}
                                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-[10px] transition-colors border border-black/10"
                                            title="Edit Role"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-[10px] transition-colors border border-black/10"
                                            title="Delete Role"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="bg-neutral-50/50 p-4 rounded-[10px] mt-2 border border-black/5">
                                    <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                                        Permissions ({role.permissions.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.permissions.map((perm) => {
                                            const module = AVAILABLE_MODULES.find(m => m.id === perm);
                                            return (
                                                <span key={perm} className="px-2 py-0.5 bg-white text-neutral-800 border border-black/10 rounded-[10px] text-xs font-normal">
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[10px] border border-black/10 shadow-none max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-black/10 flex justify-between items-center bg-neutral-50/50">
                            <h3 className="font-medium text-sm text-neutral-900 flex items-center gap-2">
                                <Shield className="text-black" size={16} />
                                {editingRole ? 'Edit Admin Role' : 'Create New Admin Role'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-neutral-400 hover:text-black transition-colors p-1 hover:bg-neutral-100 rounded-[10px]"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Role Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. Customer Support Agent, Order Manager"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-black/10 rounded-[10px] outline-none text-xs bg-white focus:border-black font-normal"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-black/10 pb-2">
                                        <label className="block text-xs font-medium text-neutral-600">Assign Modules & Permissions</label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllPermissions}
                                            className="text-xs font-medium text-black hover:underline transition-colors"
                                        >
                                            {formData.permissions.length === AVAILABLE_MODULES.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {AVAILABLE_MODULES.map((mod) => {
                                            const isSelected = formData.permissions.includes(mod.id);
                                            return (
                                                <div
                                                    key={mod.id}
                                                    onClick={() => handlePermissionToggle(mod.id)}
                                                    className={`p-3 rounded-[10px] border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                                        isSelected
                                                            ? 'border-black bg-neutral-50 shadow-none'
                                                            : 'border-black/10 hover:border-black/20 bg-white'
                                                    }`}
                                                >
                                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? 'bg-black border-black text-white'
                                                            : 'border-black/20'
                                                    }`}>
                                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-neutral-900">{mod.name}</p>
                                                        <p className="text-[10px] text-neutral-450 mt-0.5 leading-normal font-normal">{mod.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-black/10 bg-neutral-50/50 flex justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-black/10 rounded-[10px] text-xs text-neutral-700 hover:bg-neutral-50 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-black text-white rounded-[10px] text-xs font-medium hover:bg-neutral-900 disabled:opacity-50 transition-all shadow-none"
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
