'use client';

import { useState, useEffect } from 'react';
import { Shield, UserPlus, Edit, Trash2, X, User } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

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

export default function AdminTeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        admin_role_id: ''
    });

    const fetchTeam = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/admin/team');
            setTeam(response.data.data); // Pagination data wrapper
        } catch (error) {
            console.error('Failed to fetch team', error);
            showToast('Failed to load team members', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/admin/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch admin roles', error);
        }
    };

    useEffect(() => {
        fetchTeam();
        fetchRoles();
    }, []);

    const handleOpenModal = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                email: member.email,
                password: '',
                role: member.role || 'admin',
                admin_role_id: member.admin_role_id?.toString() || ''
            });
        } else {
            setEditingMember(null);
            setFormData({ 
                name: '', 
                email: '', 
                password: '', 
                role: 'admin', 
                admin_role_id: '' 
            });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const submitData = {
            ...formData,
            admin_role_id: formData.role === 'admin' ? (formData.admin_role_id ? parseInt(formData.admin_role_id) : null) : null
        };
        try {
            if (editingMember) {
                await api.put(`/admin/team/${editingMember.id}`, submitData);
                showToast('Team member updated successfully', 'success');
            } else {
                await api.post('/admin/team', submitData);
                showToast('Team member added successfully', 'success');
            }
            setIsModalOpen(false);
            fetchTeam();
        } catch (error: any) {
            console.error('Failed to save team member', error);
            showToast(error.response?.data?.message || 'Failed to save team member', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="text-cureza-green" />
                        Team & Access Control
                    </h1>
                    <p className="text-gray-500 mt-1">Manage administrators and moderators</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Add Team Member
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Role</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Joined Date</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={5} className="text-center py-8">Loading team members...</td></tr>
                        ) : team.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No team members found</td></tr>
                        ) : (
                            team.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <User size={16} />
                                        </div>
                                        {member.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            member.role === 'super_admin' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            <Shield size={12} />
                                            {member.role === 'super_admin' 
                                                ? 'Super Admin' 
                                                : `Admin (${member.admin_role?.name || 'Custom'})`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(member.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(member)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">System Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green"
                                >
                                    <option value="admin">Admin (Custom Permissions)</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                            {formData.role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Custom RBAC Role</label>
                                    <select
                                        name="admin_role_id"
                                        required
                                        value={formData.admin_role_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green"
                                    >
                                        <option value="">Select an admin role...</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Password {editingMember && '(Leave blank to keep current)'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required={!editingMember}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-cureza-green text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : (editingMember ? 'Update Member' : 'Create Member')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
