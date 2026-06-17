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
            setErrorMessage(err.response?.data?.message || 'Failed to generate database backup.');
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
        <div className="max-w-4xl space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System & Maintenance</h1>
                    <p className="text-gray-500 text-sm mt-1">Backup database records and manage platform recovery snapshots</p>
                </div>
            </div>

            {/* Notification Banners */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm flex items-center gap-3 animate-fadeIn">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span className="text-green-800 text-sm font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm flex items-center gap-3 animate-fadeIn">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
                </div>
            )}

            {/* Database Backup Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Database Backups</h3>
                        <p className="text-sm text-gray-500">Create, download, and delete manual SQLite database backups</p>
                    </div>
                </div>

                {/* Backups List */}
                <div className="space-y-3">
                    {loadingBackups ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
                            <p className="text-gray-400 text-sm">Fetching list of database backups...</p>
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                            <Database size={36} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium text-sm">No backup files found</p>
                            <p className="text-gray-400 text-xs mt-1">Generate a manual backup of the system database to start</p>
                        </div>
                    ) : (
                        backups.map((backup) => (
                            <div key={backup.name} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/70 transition-all rounded-lg border border-gray-150">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Server size={20} className="text-emerald-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 truncate text-sm font-mono">{backup.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Created: {backup.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 ml-4">
                                    <span className="text-xs font-bold text-gray-600 bg-gray-200/60 px-2 py-1 rounded">
                                        {backup.size}
                                    </span>
                                    <button 
                                        onClick={() => handleDownloadBackup(backup.name)}
                                        className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 text-xs font-bold transition-colors"
                                        title="Download database backup file"
                                    >
                                        <Download size={16} />
                                        <span className="hidden sm:inline">Download</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBackup(backup.name)}
                                        disabled={deletingBackupName === backup.name}
                                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 disabled:text-gray-400 text-xs font-bold transition-colors"
                                        title="Delete database backup file"
                                    >
                                        {deletingBackupName === backup.name ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Create Backup Button */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400">
                        Warning: Backups capture current SQLite database file. Ensure correct environment configs.
                    </p>
                    <button 
                        onClick={handleCreateBackup}
                        disabled={creatingBackup}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors font-semibold shadow-sm disabled:opacity-50 text-sm"
                    >
                        {creatingBackup ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Database size={16} />
                        )}
                        Create Manual Backup
                    </button>
                </div>
            </div>
        </div>
    );
}
