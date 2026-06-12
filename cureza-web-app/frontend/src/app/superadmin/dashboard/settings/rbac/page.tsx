'use client';

import { Shield, Users, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminRBACPage() {
    const roles = [
        { id: 1, name: 'Super Admin', users: 2, permissions: 'All Access' },
        { id: 2, name: 'Content Editor', users: 4, permissions: 'Blog, Products, Marketing' },
        { id: 3, name: 'Support Agent', users: 8, permissions: 'Orders, Messages, Refunds' },
        { id: 4, name: 'Finance Manager', users: 1, permissions: 'Reports, Payouts, Commission' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h1>
                    <p className="text-gray-500">Manage admin roles and permissions</p>
                </div>
                <button className="bg-cureza-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Plus size={18} />
                    Create New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{role.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Users size={14} /> {role.users} Users
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                                {role.name !== 'Super Admin' && (
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Permissions</p>
                            <p className="text-sm text-gray-900">{role.permissions}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
