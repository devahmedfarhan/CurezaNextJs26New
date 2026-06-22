'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, UserPlus, Edit, Trash2, X, User, Check, Plus, 
  Settings, Users, ChevronRight, Lock, Key, Mail, ShieldAlert
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    admin_role_id?: number;
    admin_role?: {
        id: number;
        name: string;
        slug: string;
    };
    created_at: string;
}

interface AdminRole {
    id: number;
    name: string;
    slug: string;
    permissions: string[];
    users_count: number;
    created_at: string;
}

const AVAILABLE_MODULES = [
    { id: 'dashboard', name: 'Dashboard Overview', desc: 'Access dashboard statistics, analytics charts, and system reports' },
    { id: 'products', name: 'Products & Catalog', desc: 'Manage products, categories, brands, tags, and web scrapers' },
    { id: 'orders', name: 'Orders & Refunds', desc: 'View customer orders, refunds, and shipments' },
    { id: 'reviews', name: 'Ratings & Reviews', desc: 'Moderate and reply to product and doctor reviews' },
    { id: 'users', name: 'User Management', desc: 'View lists and details of customers, sellers, doctors, and team members' },
    { id: 'approvals', name: 'Approvals', desc: 'Approve seller registrations and store profile changes' },
    { id: 'marketing', name: 'Marketing & Promos', desc: 'Manage discount coupons, offers, campaigns, and pixel tracking' },
    { id: 'events', name: 'Events', desc: 'Create and coordinate public events and health webinars' },
    { id: 'finance', name: 'Finance & Payouts', desc: 'Access payouts, transactions, and commission settings' },
    { id: 'support', name: 'Support & Tickets', desc: 'Manage customer, seller, and doctor support tickets' },
    { id: 'community', name: 'Cureza Circle', desc: 'Manage referrals, leaderboards, challenges, and rewards shop' },
    { id: 'cms', name: 'CMS & Blogs', desc: 'Access homepage banners, FAQ listings, and blog posts' },
    { id: 'settings', name: 'Global Settings', desc: 'Access shipping options, payment gateways, and system settings' },
];

export default function AdminTeamPage() {
    const { showToast } = useToast();

    // View State
    const [subTab, setSubTab] = useState<'members' | 'roles'>('members');

    // Members State
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [isMembersLoading, setIsMembersLoading] = useState(true);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);
    const [memberFormData, setMemberFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        admin_role_id: ''
    });

    // Roles State
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [isRolesLoading, setIsRolesLoading] = useState(true);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
    const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        permissions: [] as string[]
    });

    useEffect(() => {
        fetchTeam();
        fetchRoles();
    }, []);

    // ---- Member Operations ----
    const fetchTeam = async () => {
        setIsMembersLoading(true);
        try {
            const response = await api.get('/admin/team');
            setTeam(response.data.data || response.data); 
        } catch (error) {
            console.error('Failed to fetch team', error);
            showToast('Failed to load team members', 'error');
        } finally {
            setIsMembersLoading(false);
        }
    };

    const handleOpenMemberModal = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setMemberFormData({
                name: member.name,
                email: member.email,
                password: '',
                role: member.role || 'admin',
                admin_role_id: member.admin_role_id?.toString() || ''
            });
        } else {
            setEditingMember(null);
            setMemberFormData({ 
                name: '', 
                email: '', 
                password: '', 
                role: 'admin', 
                admin_role_id: '' 
            });
        }
        setIsMemberModalOpen(true);
    };

    const handleMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsMemberSubmitting(true);
        const submitData = {
            ...memberFormData,
            admin_role_id: memberFormData.role === 'admin' ? (memberFormData.admin_role_id ? parseInt(memberFormData.admin_role_id) : null) : null
        };
        try {
            if (editingMember) {
                await api.put(`/admin/team/${editingMember.id}`, submitData);
                showToast('Team member updated successfully', 'success');
            } else {
                await api.post('/admin/team', submitData);
                showToast('Team member added successfully', 'success');
            }
            setIsMemberModalOpen(false);
            fetchTeam();
        } catch (error: any) {
            console.error('Failed to save team member', error);
            showToast(error.response?.data?.message || 'Failed to save team member', 'error');
        } finally {
            setIsMemberSubmitting(false);
        }
    };

    const handleDeleteMember = async (id: number) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            await api.delete(`/admin/team/${id}`);
            showToast('Team member removed successfully', 'success');
            fetchTeam();
        } catch (error) {
            console.error('Failed to delete team member', error);
            showToast('Failed to delete team member', 'error');
        }
    };

    // ---- Role Operations ----
    const fetchRoles = async () => {
        setIsRolesLoading(true);
        try {
            const response = await api.get('/admin/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch admin roles', error);
            showToast('Failed to load access roles', 'error');
        } finally {
            setIsRolesLoading(false);
        }
    };

    const handleOpenRoleModal = (role?: AdminRole) => {
        if (role) {
            setEditingRole(role);
            setRoleFormData({
                name: role.name,
                permissions: role.permissions
            });
        } else {
            setEditingRole(null);
            setRoleFormData({
                name: '',
                permissions: []
            });
        }
        setIsRoleModalOpen(true);
    };

    const handlePermissionToggle = (moduleId: string) => {
        setRoleFormData(prev => {
            const hasPermission = prev.permissions.includes(moduleId);
            const nextPermissions = hasPermission
                ? prev.permissions.filter(p => p !== moduleId)
                : [...prev.permissions, moduleId];
            return { ...prev, permissions: nextPermissions };
        });
    };

    const handleSelectAllPermissions = () => {
        const allIds = AVAILABLE_MODULES.map(m => m.id);
        const isAllSelected = roleFormData.permissions.length === allIds.length;
        setRoleFormData(prev => ({
            ...prev,
            permissions: isAllSelected ? [] : allIds
        }));
    };

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleFormData.name.trim()) {
            showToast('Please enter a role name', 'error');
            return;
        }
        if (roleFormData.permissions.length === 0) {
            showToast('Please select at least one permission module', 'error');
            return;
        }

        setIsRoleSubmitting(true);
        try {
            if (editingRole) {
                await api.put(`/admin/roles/${editingRole.id}`, roleFormData);
                showToast('Role updated successfully', 'success');
            } else {
                await api.post('/admin/roles', roleFormData);
                showToast('Role created successfully', 'success');
            }
            setIsRoleModalOpen(false);
            fetchRoles();
            fetchTeam();
        } catch (error: any) {
            console.error('Failed to save role', error);
            showToast(error.response?.data?.message || 'Failed to save role', 'error');
        } finally {
            setIsRoleSubmitting(false);
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/roles/${id}`);
            showToast('Role deleted successfully', 'success');
            fetchRoles();
            fetchTeam();
        } catch (error: any) {
            console.error('Failed to delete role', error);
            showToast(error.response?.data?.message || 'Failed to delete role', 'error');
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Team & Access Control</h1>
                    <p className="text-neutral-500 text-xs font-normal mt-1">Manage platform administrators, moderators, and customize Role-Based Access Control (RBAC) permissions.</p>
                </div>
                <div className="flex gap-2 self-start md:self-center">
                    {subTab === 'members' ? (
                        <button
                            onClick={() => handleOpenMemberModal()}
                            className="bg-black text-white px-5 py-2.5 rounded-[10px] hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 font-medium text-xs shadow-none"
                        >
                            <UserPlus size={14} /> Add Team Member
                        </button>
                    ) : (
                        <button
                            onClick={() => handleOpenRoleModal()}
                            className="bg-black text-white px-5 py-2.5 rounded-[10px] hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 font-medium text-xs shadow-none"
                        >
                            <Plus size={14} /> Create Role
                        </button>
                    )}
                </div>
            </div>

            {/* Sub Tabs Control */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-[10px] border-[0.5px] border-black/50 shadow-none">
                <div className="flex items-center bg-neutral-50/70 p-0.5 rounded-lg border-[0.5px] border-black/50 flex-wrap">
                    <button
                        onClick={() => setSubTab('members')}
                        className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                            subTab === 'members' ? 'bg-white text-neutral-900 border-[0.5px] border-black/50' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        Team Directory
                    </button>
                    <button
                        onClick={() => setSubTab('roles')}
                        className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                            subTab === 'roles' ? 'bg-white text-neutral-900 border-[0.5px] border-black/50' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        RBAC Roles & Permissions
                    </button>
                </div>
            </div>

            {/* ---- VIEW 1: TEAM MEMBERS DIRECTORY ---- */}
            {subTab === 'members' && (
                <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none overflow-hidden animate-in fade-in duration-300">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50/50 border-b-[0.5px] border-black/50">
                            <tr className="text-neutral-500 font-medium">
                                <th className="px-6 py-4 text-xs tracking-wide">Member Name</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Email Address</th>
                                <th className="px-6 py-4 text-xs tracking-wide">System Role</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Joined Date</th>
                                <th className="px-6 py-4 text-xs tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-950/5 bg-white text-neutral-750 font-normal text-xs">
                            {isMembersLoading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-xs text-neutral-400 font-medium animate-pulse">Loading team members...</td></tr>
                            ) : team.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-xs text-neutral-500 font-medium">No team members found</td></tr>
                            ) : (
                                team.map((member) => (
                                    <tr key={member.id} className="hover:bg-neutral-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-100 border-[0.5px] border-black/50 text-neutral-700 flex items-center justify-center font-semibold text-sm">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                {member.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600">{member.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wide border-[0.5px] 
                                                ${member.role === 'super_admin' 
                                                    ? 'bg-neutral-900 text-white border-transparent' 
                                                    : 'bg-neutral-50 text-neutral-850 border-black/50'}`}>
                                                <Shield size={10} />
                                                {member.role === 'super_admin' 
                                                    ? 'Super Admin' 
                                                    : `Admin (${member.admin_role?.name || 'Custom'})`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500">{new Date(member.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button 
                                                    onClick={() => handleOpenMemberModal(member)} 
                                                    className="p-1.5 bg-neutral-50 hover:bg-neutral-100 border-[0.5px] border-black/50 text-neutral-500 hover:text-neutral-900 rounded-lg transition-colors" 
                                                    title="Edit"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteMember(member.id)} 
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 border-[0.5px] border-black/50 text-red-600 rounded-lg transition-colors" 
                                                    title="Remove"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---- VIEW 2: ROLES & PERMISSIONS EDITOR ---- */}
            {subTab === 'roles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    {isRolesLoading ? (
                        <div className="col-span-full text-center py-12 text-xs text-neutral-400 font-medium animate-pulse bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none">
                            Loading access roles...
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-xs text-neutral-500 font-medium bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none">
                            No roles defined. Create a custom role to configure permissions.
                        </div>
                    ) : (
                        roles.map((role) => (
                            <div key={role.id} className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 shadow-none flex flex-col justify-between space-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-neutral-100 text-neutral-900 rounded-lg border-[0.5px] border-black/50">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-neutral-900 text-base leading-snug">{role.name}</h3>
                                                <p className="text-[10px] text-neutral-450 font-semibold uppercase tracking-wider mt-0.5">
                                                    {role.users_count || 0} Admins Assigned
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleOpenRoleModal(role)}
                                                className="p-1.5 bg-neutral-50 border-[0.5px] border-black/50 text-neutral-500 hover:bg-neutral-105 hover:text-neutral-900 rounded-lg transition-colors"
                                                title="Edit Role"
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRole(role.id)}
                                                className="p-1.5 bg-red-50 border-[0.5px] border-black/50 text-red-650 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete Role"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-50 p-4 rounded-[10px] border-[0.5px] border-black/50 space-y-2">
                                        <span className="text-[9px] font-semibold text-neutral-450 uppercase tracking-wider block">
                                            Assigned Permissions ({role.permissions.length})
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.map((perm) => {
                                                const module = AVAILABLE_MODULES.find(m => m.id === perm);
                                                return (
                                                    <span key={perm} className="px-2 py-0.5 bg-white text-neutral-700 border-[0.5px] border-black/50 rounded text-[9px] font-semibold uppercase">
                                                        {module ? module.name : perm}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* MEMBER DIALOG (ADD/EDIT TEAM MEMBER) */}
            <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
                <DialogContent className="max-w-md rounded-[10px] p-6 bg-white shadow-none border-[0.5px] border-black/50">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-neutral-900">
                            {editingMember ? 'Edit Staff Profile' : 'Register Admin / Team'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleMemberSubmit} className="space-y-4 py-2">
                        <div>
                            <label className="block text-xs font-medium text-neutral-450 uppercase tracking-wider mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                value={memberFormData.name}
                                onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                                className="w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                placeholder="Staff Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-450 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                disabled={!!editingMember}
                                value={memberFormData.email}
                                onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                                className={`w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black ${editingMember ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-black/50' : ''}`}
                                placeholder="email@cureza.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-450 uppercase tracking-wider mb-1.5">System Access Role</label>
                            <select
                                value={memberFormData.role}
                                onChange={(e) => setMemberFormData({ ...memberFormData, role: e.target.value })}
                                className="w-full px-3 py-2.5 border-[0.5px] border-black/50 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black bg-white cursor-pointer outline-none text-neutral-800"
                            >
                                <option value="admin">Admin (Custom Permissions)</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        
                        {memberFormData.role === 'admin' && (
                            <div>
                                <label className="block text-xs font-medium text-neutral-450 uppercase tracking-wider mb-1.5">Custom RBAC Role Profile</label>
                                <select
                                    required
                                    value={memberFormData.admin_role_id}
                                    onChange={(e) => setMemberFormData({ ...memberFormData, admin_role_id: e.target.value })}
                                    className="w-full px-3 py-2.5 border-[0.5px] border-black/50 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black bg-white cursor-pointer outline-none text-neutral-800"
                                >
                                    <option value="">Select RBAC role...</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-neutral-450 uppercase tracking-wider mb-1.5">
                                Password {editingMember && '(Leave blank to keep current)'}
                            </label>
                            <input
                                type="password"
                                required={!editingMember}
                                value={memberFormData.password}
                                onChange={(e) => setMemberFormData({ ...memberFormData, password: e.target.value })}
                                className="w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                                placeholder="••••••••"
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t-[0.5px] border-black/50 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsMemberModalOpen(false)}
                                className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 rounded-[10px] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isMemberSubmitting}
                                className="px-6 py-2.5 rounded-[10px] bg-black text-white text-xs font-medium hover:bg-neutral-900 transition-colors shadow-none"
                            >
                                {isMemberSubmitting ? 'Saving...' : (editingMember ? 'Update Staff' : 'Register Staff')}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ROLE CONFIGURATION DIALOG (ADD/EDIT RBAC ROLE) */}
            <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-[10px] p-6 bg-white shadow-none border-[0.5px] border-black/50">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                            <Shield className="text-neutral-900" size={18} />
                            {editingRole ? 'Configure Role Details' : 'Create Custom RBAC Role'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRoleSubmit} className="space-y-6 py-3">
                        <div>
                            <label className="block text-xs font-medium text-neutral-450 uppercase tracking-wider mb-1.5">Role Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Order Manager, Support Lead"
                                value={roleFormData.name}
                                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                                className="w-full px-4 py-2.5 text-xs font-normal border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b-[0.5px] border-black/50 pb-2">
                                <label className="text-xs font-semibold text-neutral-450 uppercase tracking-wider">Select Access Permissions</label>
                                <button
                                    type="button"
                                    onClick={handleSelectAllPermissions}
                                    className="text-[10px] font-semibold text-neutral-900 hover:underline uppercase tracking-wider"
                                >
                                    {roleFormData.permissions.length === AVAILABLE_MODULES.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {AVAILABLE_MODULES.map((mod) => {
                                    const isSelected = roleFormData.permissions.includes(mod.id);
                                    return (
                                        <div
                                            key={mod.id}
                                            onClick={() => handlePermissionToggle(mod.id)}
                                            className={`p-3.5 rounded-[10px] border-[0.5px] transition-all cursor-pointer flex items-start gap-3 select-none ${
                                                isSelected
                                                    ? 'border-black bg-neutral-50 shadow-none'
                                                    : 'border-black/50 hover:border-neutral-950/20 bg-white'
                                            }`}
                                        >
                                            <div className={`mt-0.5 w-4 h-4 rounded border-[0.5px] flex items-center justify-center transition-all ${
                                                isSelected
                                                    ? 'bg-black border-black text-white'
                                                    : 'border-black/50'
                                            }`}>
                                                {isSelected && <Check size={11} strokeWidth={3} />}
                                            </div>
                                            <div className="flex-1 min-w-0 text-xs">
                                                <p className="font-semibold text-neutral-900">{mod.name}</p>
                                                <p className="text-[10px] text-neutral-450 mt-0.5 leading-normal font-normal">{mod.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t-[0.5px] border-black/50 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsRoleModalOpen(false)}
                                className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 rounded-[10px] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isRoleSubmitting}
                                className="px-6 py-2.5 rounded-[10px] bg-black text-white text-xs font-medium hover:bg-neutral-900 transition-colors shadow-none"
                            >
                                {isRoleSubmitting ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
