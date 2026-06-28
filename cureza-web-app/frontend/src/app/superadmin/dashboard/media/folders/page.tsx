'use client';

import React, { useEffect, useState } from 'react';
import { Folder, Plus, Edit2, Trash2, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/contexts/ToastContext";
import api from '@/lib/api';

interface FolderItem {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    media_count: number;
}

export default function FoldersManagement() {
    const { showToast } = useToast();
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [activeFolder, setActiveFolder] = useState<FolderItem | null>(null);
    const [folderName, setFolderName] = useState('');
    const [folderParentId, setFolderParentId] = useState<string>('null');

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/media/folders');
            setFolders(res.data);
        } catch (error) {
            showToast('Failed to fetch folders', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!folderName.trim()) return;
        try {
            await api.post('/admin/media/folders', {
                name: folderName,
                parent_id: folderParentId === 'null' ? null : parseInt(folderParentId)
            });
            setFolderName('');
            setIsCreateOpen(false);
            showToast('Folder created successfully', 'success');
            fetchFolders();
        } catch (error) {
            showToast('Failed to create folder', 'error');
        }
    };

    const handleEditFolder = async () => {
        if (!activeFolder || !folderName.trim()) return;
        try {
            await api.put(`/admin/media/folders/${activeFolder.id}`, {
                name: folderName,
                parent_id: folderParentId === 'null' ? null : parseInt(folderParentId)
            });
            setIsEditOpen(false);
            setActiveFolder(null);
            setFolderName('');
            showToast('Folder renamed successfully', 'success');
            fetchFolders();
        } catch (error) {
            showToast('Failed to update folder', 'error');
        }
    };

    const handleDeleteFolder = async (id: number) => {
        if (!confirm('Are you sure you want to delete this folder? Files inside will be moved to Root.')) return;
        try {
            await api.delete(`/admin/media/folders/${id}`);
            showToast('Folder deleted. Files moved to root.', 'success');
            fetchFolders();
        } catch (error) {
            showToast('Failed to delete folder', 'error');
        }
    };

    const getParentName = (parentId: number | null) => {
        if (!parentId) return 'Root';
        const parent = folders.find(f => f.id === parentId);
        return parent ? parent.name : 'Unknown';
    };

    return (
        <div className="w-full space-y-6 container mx-auto px-4 md:px-6 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[#052326]">Folder Directories</h1>
                    <p className="text-sm text-neutral-500 mt-1">Organize your files into logical nested folders</p>
                </div>
                
                <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if(open) { setFolderName(''); setFolderParentId('null'); } }}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#052326] text-white hover:bg-[#052326]/90 gap-2" style={{ borderRadius: '8px' }}>
                            <Plus className="w-4 h-4 text-[#D4AF37]" />
                            Create Folder
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Folder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Folder Name</label>
                                <Input placeholder="e.g. Testimonials" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Parent Folder (for nesting)</label>
                                <select 
                                    value={folderParentId} 
                                    onChange={(e) => setFolderParentId(e.target.value)}
                                    className="w-full p-2 border rounded text-sm focus:outline-none"
                                >
                                    <option value="null">None (Root Folder)</option>
                                    {folders.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateFolder} className="bg-[#052326] text-white hover:bg-[#052326]/90">Save Folder</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* FOLDERS GRID */}
            {isLoading ? (
                <div className="text-center py-12">Loading folders...</div>
            ) : folders.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 bg-white border border-[#052326]/10 rounded-lg">
                    <Folder className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                    <p>No directories created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {folders.map(folder => (
                        <div 
                            key={folder.id}
                            className="bg-white p-4 flex flex-col justify-between transition-colors group"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(85, 85, 85, 0.18)'
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#D4AF37]/10 rounded">
                                        <Folder className="w-6 h-6 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#052326]">{folder.name}</h3>
                                        <p className="text-xs text-neutral-400 mt-0.5">Parent: <span className="font-medium text-neutral-500">{getParentName(folder.parent_id)}</span></p>
                                    </div>
                                </div>
                                <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded font-medium text-neutral-600">
                                    {folder.media_count || 0} items
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t pt-3 mt-4 border-neutral-100">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-neutral-500 hover:text-[#052326] h-8 px-2.5"
                                    onClick={() => {
                                        setActiveFolder(folder);
                                        setFolderName(folder.name);
                                        setFolderParentId(folder.parent_id ? folder.parent_id.toString() : 'null');
                                        setIsEditOpen(true);
                                    }}
                                >
                                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500 hover:text-red-600 h-8 px-2.5"
                                    onClick={() => handleDeleteFolder(folder.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Folder Name</label>
                            <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Parent Folder</label>
                            <select 
                                value={folderParentId} 
                                onChange={(e) => setFolderParentId(e.target.value)}
                                className="w-full p-2 border rounded text-sm focus:outline-none"
                            >
                                <option value="null">None (Root Folder)</option>
                                {folders
                                    .filter(f => f.id !== activeFolder?.id) // Prevent self-referencing
                                    .map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditFolder} className="bg-[#052326] text-white hover:bg-[#052326]/90">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
