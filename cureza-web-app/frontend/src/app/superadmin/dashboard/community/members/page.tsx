'use client';

import { useState } from 'react';
import { Search, Filter, Award, Star, Shield } from 'lucide-react';

export default function AdminMembersPage() {
    const members = [
        { id: 1, name: 'Aarav Gupta', tier: 'Ambassador', xp: 12500, joined: '2024-01-15', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Aarav+Gupta&background=random' },
        { id: 2, name: 'Ishita Sharma', tier: 'Creator', xp: 5400, joined: '2024-03-22', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Ishita+Sharma&background=random' },
        { id: 3, name: 'Rohan Mehta', tier: 'Explorer', xp: 1200, joined: '2024-05-10', status: 'Inactive', avatar: 'https://ui-avatars.com/api/?name=Rohan+Mehta&background=random' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cureza Circle Members</h1>
                    <p className="text-gray-500">Manage community members and their tiers</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-[0.5px] border-black/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Filter size={18} /> Filter
                </button>
            </div>

            <div className="bg-white rounded-xl border-[0.5px] border-black/50 shadow-none overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP Points</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                                        <span className="font-medium text-gray-900">{member.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${member.tier === 'Ambassador' ? 'bg-purple-100 text-purple-800' :
                                            member.tier === 'Creator' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {member.tier === 'Ambassador' && <Award size={12} />}
                                        {member.tier === 'Creator' && <Star size={12} />}
                                        {member.tier === 'Explorer' && <Shield size={12} />}
                                        {member.tier}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{member.xp.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.joined}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-cureza-green hover:text-green-900">View Profile</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
