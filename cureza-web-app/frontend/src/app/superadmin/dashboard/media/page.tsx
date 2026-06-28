'use client';

import React, { useEffect, useState } from 'react';
import MediaLibrary from '@/components/admin/MediaLibrary';
import { Database, Image as ImageIcon, Folder, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
    total_images: number;
    total_storage_bytes: number;
    total_storage_formatted: string;
    folders_count: number;
    trash_count: number;
}

export default function AdminMediaDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/media/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch media statistics:', error);
        }
    };

    return (
        <div className="w-full space-y-6 container mx-auto px-4 md:px-6 py-6">
            {/* Title */}
            <div>
                <h1 className="text-2xl font-semibold text-[#052326]">Media Library</h1>
                <p className="text-sm text-neutral-500 mt-1">Manage and optimize your CDN-served assets using ImageKit.io</p>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div 
                    className="bg-white p-4 flex items-center gap-4 transition-all duration-300"
                    style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(85, 85, 85, 0.18)'
                    }}
                >
                    <div className="p-3 bg-[#052326]/5 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-[#052326]" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 font-medium">Total Files</p>
                        <h3 className="text-lg font-semibold text-[#052326] mt-0.5">{stats?.total_images ?? 0}</h3>
                    </div>
                </div>

                <div 
                    className="bg-white p-4 flex items-center gap-4 transition-all duration-300"
                    style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(85, 85, 85, 0.18)'
                    }}
                >
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                        <Database className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 font-medium">CDN Storage Used</p>
                        <h3 className="text-lg font-semibold text-[#052326] mt-0.5">{stats?.total_storage_formatted ?? '0 B'}</h3>
                    </div>
                </div>

                <div 
                    className="bg-white p-4 flex items-center gap-4 transition-all duration-300"
                    style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(85, 85, 85, 0.18)'
                    }}
                >
                    <div className="p-3 bg-[#052326]/5 rounded-lg">
                        <Folder className="w-5 h-5 text-[#052326]" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 font-medium">Folders Count</p>
                        <h3 className="text-lg font-semibold text-[#052326] mt-0.5">{stats?.folders_count ?? 0}</h3>
                    </div>
                </div>

                <div 
                    className="bg-white p-4 flex items-center gap-4 transition-all duration-300"
                    style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(85, 85, 85, 0.18)'
                    }}
                >
                    <div className="p-3 bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-400 font-medium">Trash / Trashed</p>
                        <h3 className="text-lg font-semibold text-[#052326] mt-0.5">{stats?.trash_count ?? 0}</h3>
                    </div>
                </div>
            </div>

            {/* Media library container */}
            <div className="bg-white" style={{ borderRadius: '8px' }}>
                <MediaLibrary />
            </div>
        </div>
    );
}
