'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    Server, 
    Download, 
    Database, 
    Trash2, 
    Loader2, 
    CheckCircle, 
    AlertCircle 
} from 'lucide-react';

interface Backup {
    name: string;
    size: string;
    date: string;
    timestamp: number;
}

export default function AdminSystemPage() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loadingBackups, setLoadingBackups] = useState(true);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [deletingBackupName, setDeletingBackupName] = useState<string | null>(null);

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            setLoadingBackups(true);
            const response = await api.get('/admin/backups');
            setBackups(response.data);
        } catch (err: any) {
            console.error('Failed to load backups:', err);
            setErrorMessage('Failed to retrieve backups list.');
        } finally {
            setLoadingBackups(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await api.post('/admin/backups');
            setSuccessMessage(response.data.message || 'Database backup generated successfully!');
            fetchBackups();
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err: any) {
            console.error('Failed to create backup:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to generate database database backup.');
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleDownloadBackup = async (name: string) => {
        try {
            setSuccessMessage(`Preparing download for ${name}...`);
            const response = await api.get(`/admin/backups/${name}/download`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            setSuccessMessage('');
        } catch (err: any) {
            console.error('Failed to download backup:', err);
            setErrorMessage('Failed to download the backup file.');
        }
    };

    const handleDeleteBackup = async (name: string) => {
        if (!confirm(`Are you sure you want to permanently delete the backup file "${name}"?`)) {
            return;
        }

        setDeletingBackupName(name);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await api.delete(`/admin/backups/${name}`);
            setSuccessMessage(response.data.message || 'Backup file deleted successfully.');
            setBackups(prev => prev.filter(b => b.name !== name));
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err: any) {
            console.error('Failed to delete backup:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to delete backup file.');
        } finally {
            setDeletingBackupName(null);
        }
    };

    return (
        <div className="w-full space-y-6 pb-12 font-sans text-neutral-900">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-black/10 pb-5">
                <div>
                    <h2 className="text-sm font-medium text-neutral-900 tracking-tight">System & Maintenance</h2>
                    <p className="text-neutral-500 text-xs mt-0.5">Backup database records and manage platform recovery snapshots</p>
                </div>
            </div>

            {/* Notification Banners */}
            {successMessage && (
                <div className="bg-green-50 border-l-2 border-green-500 p-4 rounded-[10px] shadow-none flex items-center gap-3 animate-fadeIn">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    <span className="text-green-800 text-xs font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-2 border-red-500 p-4 rounded-[10px] shadow-none flex items-center gap-3 animate-fadeIn">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                    <span className="text-red-800 text-xs font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Database Backup Card */}
            <div className="bg-white p-6 rounded-[10px] border border-black/10 shadow-none animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2.5 bg-neutral-50 text-black border border-black/10 rounded-[10px] shadow-none">
                        <Database size={20} />
                    </div>
                    <div>
                        <h3 className="font-medium text-neutral-900 text-sm">Database Backups</h3>
                        <p className="text-xs text-neutral-500 font-normal">Create, download, and delete manual SQLite database backups</p>
                    </div>
                </div>

                {/* Backups List */}
                <div className="space-y-3">
                    {loadingBackups ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="animate-spin text-black mb-2" size={28} />
                            <p className="text-neutral-450 text-xs font-normal">Fetching list of database backups...</p>
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="border border-dashed border-black/10 rounded-[10px] p-8 text-center bg-neutral-50/20">
                            <Database size={30} className="text-neutral-350 mx-auto mb-2" />
                            <p className="text-neutral-800 font-medium text-xs">No backup files found</p>
                            <p className="text-neutral-450 text-[10px] mt-1 font-normal">Generate a manual backup of the system database to start</p>
                        </div>
                    ) : (
                        backups.map((backup) => (
                            <div key={backup.name} className="flex items-center justify-between p-4 bg-neutral-50/30 hover:bg-neutral-50/60 transition-all rounded-[10px] border border-black/10">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Server size={18} className="text-black flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-neutral-900 truncate text-xs font-mono">{backup.name}</p>
                                        <p className="text-[10px] text-neutral-450 mt-0.5 font-normal">Created: {backup.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                    <span className="text-[10px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-black/5">
                                        {backup.size}
                                    </span>
                                    <button 
                                        onClick={() => handleDownloadBackup(backup.name)}
                                        className="flex items-center gap-1 text-black hover:underline text-xs font-medium transition-colors"
                                        title="Download database backup file"
                                    >
                                        <Download size={14} />
                                        <span className="hidden sm:inline">Download</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBackup(backup.name)}
                                        disabled={deletingBackupName === backup.name}
                                        className="flex items-center gap-1 text-neutral-600 hover:text-black disabled:text-neutral-300 text-xs font-medium transition-colors"
                                        title="Delete database backup file"
                                    >
                                        {deletingBackupName === backup.name ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create Backup Button */}
                <div className="mt-6 pt-6 border-t border-black/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <p className="text-[10px] text-neutral-450 font-normal leading-relaxed max-w-md">
                        Warning: Backups capture current SQLite database file. Ensure correct environment configs.
                    </p>
                    <button 
                        onClick={handleCreateBackup}
                        disabled={creatingBackup}
                        className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] flex items-center gap-2 font-medium transition-all disabled:opacity-50 text-xs shrink-0"
                    >
                        {creatingBackup ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Database size={14} />
                        )}
                        Create Manual Backup
                    </button>
                </div>
            </div>
        </div>
    );
}
