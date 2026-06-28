'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Grid, List, FolderPlus, Upload, Trash2, Folder, 
    FileText, Video, Image as ImageIcon, MoreVertical, Copy, 
    Check, ArrowLeft, RefreshCw, X, ChevronRight, Tags, ArrowUpDown, Download, Link2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/contexts/ToastContext";
import api from '@/lib/api';
import { getImageKitUrl, imageKitHelpers } from '@/lib/imagekit';

interface MediaItem {
    id: number;
    file_id: string;
    url: string;
    thumbnail_url: string;
    file_name: string;
    folder_id: number | null;
    width: number | null;
    height: number | null;
    size_bytes: number;
    extension: string;
    title: string | null;
    alt_text: string | null;
    caption: string | null;
    description: string | null;
    tags: string[] | null;
    created_at: string;
}

interface FolderItem {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    media_count: number;
}

interface MediaLibraryProps {
    isPicker?: boolean;
    onSelect?: (urls: string[]) => void;
    multiple?: boolean;
}

export default function MediaLibrary({ isPicker = false, onSelect, multiple = false }: MediaLibraryProps) {
    const { showToast } = useToast();
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | 'root'>('root');
    const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [allTags, setAllTags] = useState<string[]>([]);
    
    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Selections & Details Drawer
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
    const [copiedUrlId, setCopiedUrlId] = useState<number | null>(null);

    // Folders actions
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderParentId, setNewFolderParentId] = useState<number | null>(null);

    // Upload state
    const [uploadQueue, setUploadQueue] = useState<{ id: string; name: string; progress: number; status: 'uploading' | 'done' | 'failed' }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch core data on mount and filter changes
    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        fetchMedia(1);
    }, [currentFolderId, searchQuery, selectedType, selectedTag]);

    const fetchMedia = async (page = 1) => {
        setIsLoading(true);
        try {
            const params: any = {
                page,
                per_page: 24,
                folder_id: currentFolderId === 'root' ? '' : currentFolderId,
            };

            if (searchQuery) params.search = searchQuery;
            if (selectedType !== 'all') params.type = selectedType;
            if (selectedTag !== 'all') params.tag = selectedTag;

            const res = await api.get('/admin/media', { params });
            setMediaItems(res.data.data);
            setCurrentPage(res.data.current_page);
            setTotalPages(res.data.last_page);
            setTotalItems(res.data.total);

            // Extract tags for filter from loaded items
            const tagsSet = new Set<string>();
            res.data.data.forEach((item: MediaItem) => {
                if (item.tags) {
                    item.tags.forEach(t => tagsSet.add(t));
                }
            });
            if (tagsSet.size > 0) {
                setAllTags(prev => Array.from(new Set([...prev, ...Array.from(tagsSet)])));
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
            showToast('Failed to fetch media assets', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFolders = async () => {
        try {
            const res = await api.get('/admin/media/folders');
            setFolders(res.data);
        } catch (error) {
            console.error('Failed to fetch folders:', error);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await api.post('/admin/media/folders', {
                name: newFolderName,
                parent_id: newFolderParentId || (currentFolderId === 'root' ? null : currentFolderId)
            });
            setNewFolderName('');
            setIsCreateFolderOpen(false);
            showToast('Folder created successfully', 'success');
            fetchFolders();
        } catch (error) {
            showToast('Failed to create folder', 'error');
        }
    };

    // Breadcrumbs
    const getBreadcrumbs = () => {
        const trail: { id: number | 'root'; name: string }[] = [{ id: 'root', name: 'Media Root' }];
        if (currentFolderId !== 'root') {
            const path: FolderItem[] = [];
            let current = folders.find(f => f.id === currentFolderId);
            while (current) {
                path.unshift(current);
                const parentId = current.parent_id;
                current = parentId ? folders.find(f => f.id === parentId) : undefined;
            }
            path.forEach(f => trail.push({ id: f.id, name: f.name }));
        }
        return trail;
    };

    const navigateToFolder = (folderId: number | 'root') => {
        setCurrentFolderId(folderId);
        if (folderId === 'root') {
            setCurrentFolder(null);
        } else {
            setCurrentFolder(folders.find(f => f.id === folderId) || null);
        }
        setSelectedIds([]);
        setActiveItem(null);
    };

    // Handle Uploads
    const processFilesUpload = async (files: FileList) => {
        const activeFolder = currentFolderId === 'root' ? null : currentFolderId;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const tempId = Math.random().toString(36).substring(7);
            
            setUploadQueue(prev => [...prev, { id: tempId, name: file.name, progress: 10, status: 'uploading' }]);

            const formData = new FormData();
            formData.append('file', file);
            if (activeFolder) {
                formData.append('folder_id', activeFolder.toString());
            }

            try {
                const response = await api.post('/admin/media/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 50;
                        setUploadQueue(prev => prev.map(item => item.id === tempId ? { ...item, progress } : item));
                    }
                });

                setUploadQueue(prev => prev.map(item => item.id === tempId ? { ...item, progress: 100, status: 'done' } : item));
                setMediaItems(prev => [response.data, ...prev]);
                showToast(`Uploaded ${file.name}`, 'success');
            } catch (error) {
                setUploadQueue(prev => prev.map(item => item.id === tempId ? { ...item, status: 'failed' } : item));
                showToast(`Upload failed for ${file.name}`, 'error');
            }
        }

        // Clean queue after a few seconds
        setTimeout(() => {
            setUploadQueue(prev => prev.filter(item => item.status === 'uploading'));
        }, 5000);
    };

    // Drag and Drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            processFilesUpload(e.dataTransfer.files);
        }
    };

    // Media Actions
    const handleSelectFile = (id: number) => {
        if (isPicker && !multiple) {
            setSelectedIds([id]);
            return;
        }

        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCopyUrl = (url: string, id: number) => {
        navigator.clipboard.writeText(url);
        setCopiedUrlId(id);
        showToast('CDN Link Copied!', 'success');
        setTimeout(() => setCopiedUrlId(null), 2000);
    };

    const handleSoftDelete = async (id: number) => {
        try {
            await api.delete(`/admin/media/${id}`);
            setMediaItems(prev => prev.filter(x => x.id !== id));
            if (activeItem?.id === id) setActiveItem(null);
            showToast('Media moved to Trash', 'success');
        } catch (error) {
            showToast('Failed to delete media', 'error');
        }
    };

    const handleUpdateMetadata = async (item: MediaItem, fieldData: Partial<MediaItem>) => {
        try {
            const res = await api.put(`/admin/media/${item.id}`, fieldData);
            setMediaItems(prev => prev.map(x => x.id === item.id ? res.data : x));
            setActiveItem(res.data);
            showToast('Metadata updated', 'success');
        } catch (error) {
            showToast('Failed to update metadata', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        try {
            await api.post('/admin/media/bulk', {
                action: 'delete',
                ids: selectedIds
            });
            setMediaItems(prev => prev.filter(x => !selectedIds.includes(x.id)));
            setSelectedIds([]);
            showToast('Items moved to Trash', 'success');
        } catch (error) {
            showToast('Bulk delete failed', 'error');
        }
    };

    const handleBulkMove = async (folderId: number) => {
        if (selectedIds.length === 0) return;
        try {
            await api.post('/admin/media/bulk', {
                action: 'move',
                ids: selectedIds,
                folder_id: folderId
            });
            // If in active folder view and moved, remove from list
            if (currentFolderId !== 'root') {
                setMediaItems(prev => prev.filter(x => !selectedIds.includes(x.id)));
            }
            setSelectedIds([]);
            showToast('Selected items moved successfully', 'success');
            fetchFolders();
        } catch (error) {
            showToast('Bulk move failed', 'error');
        }
    };

    const handleTriggerPickerSelect = () => {
        if (onSelect && selectedIds.length > 0) {
            const urls = mediaItems
                .filter(x => selectedIds.includes(x.id))
                .map(x => x.url);
            onSelect(urls);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div 
            className={`w-full min-h-[550px] bg-[#F8F3EF]/30 flex flex-col ${isDragging ? 'border-2 border-dashed border-[#D4AF37] bg-[#F8F3EF]' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                borderRadius: '8px',
                border: '1px solid rgba(85, 85, 85, 0.18)'
            }}
        >
            {/* DRAG OVERLAY */}
            {isDragging && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#F8F3EF]/90 text-[#052326]">
                    <Upload className="w-16 h-16 text-[#D4AF37] animate-bounce mb-4" />
                    <h3 className="text-xl font-medium">Drop files to upload instantly</h3>
                    <p className="text-sm text-neutral-500">Supports Images, Videos, PDFs</p>
                </div>
            )}

            {/* HEADER CONTROLS */}
            <div className="p-4 border-b border-[#052326]/10 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search & Breadcrumbs */}
                <div className="flex flex-col gap-2 flex-grow max-w-xl">
                    <div className="flex items-center gap-1.5 flex-wrap text-sm text-neutral-500">
                        {getBreadcrumbs().map((b, i) => (
                            <React.Fragment key={b.id}>
                                {i > 0 && <ChevronRight className="w-4 h-4 text-neutral-300" />}
                                <button 
                                    onClick={() => navigateToFolder(b.id)}
                                    className={`hover:text-[#052326] transition-colors ${currentFolderId === b.id ? 'font-semibold text-[#052326]' : ''}`}
                                >
                                    {b.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input 
                            placeholder="Search by filename, tag, description..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 border-[#052326]/15 focus-visible:ring-[#052326]"
                            style={{ borderRadius: '8px' }}
                        />
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[120px] h-9 border-[#052326]/15" style={{ borderRadius: '8px' }}>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="video">Videos</SelectItem>
                            <SelectItem value="document">Documents</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedTag} onValueChange={setSelectedTag}>
                        <SelectTrigger className="w-[120px] h-9 border-[#052326]/15" style={{ borderRadius: '8px' }}>
                            <SelectValue placeholder="All Tags" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tags</SelectItem>
                            {allTags.map(tag => (
                                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-9 border-[#052326]/15 hover:bg-[#F8F3EF] gap-2 text-neutral-700" style={{ borderRadius: '8px' }}>
                                <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
                                New Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Folder</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Input
                                        placeholder="Folder Name (e.g. Products)"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="col-span-4"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateFolder} className="bg-[#052326] text-white hover:bg-[#052326]/90">Create Folder</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={() => fileInputRef.current?.click()} className="h-9 bg-[#052326] text-white hover:bg-[#052326]/90 gap-2" style={{ borderRadius: '8px' }}>
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        Upload
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        multiple 
                        className="hidden" 
                        onChange={(e) => e.target.files && processFilesUpload(e.target.files)} 
                    />

                    <div className="flex border border-[#052326]/15 overflow-hidden" style={{ borderRadius: '8px' }}>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-9 w-9 rounded-none ${viewMode === 'grid' ? 'bg-[#F8F3EF]' : ''}`} 
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-9 w-9 rounded-none ${viewMode === 'list' ? 'bg-[#F8F3EF]' : ''}`} 
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* BULK ACTIONS / QUEUE PROGRESS BAR */}
            {uploadQueue.some(x => x.status === 'uploading') && (
                <div className="bg-[#F8F3EF]/60 p-3 border-b border-[#052326]/10 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-neutral-600 flex items-center justify-between">
                        <span>Uploading files...</span>
                        <span>{uploadQueue.filter(x => x.status === 'done').length} / {uploadQueue.length} Done</span>
                    </div>
                    <div className="flex gap-2 flex-wrap max-h-[80px] overflow-y-auto">
                        {uploadQueue.map(item => (
                            <div key={item.id} className="text-xs bg-white border px-2 py-1 flex items-center gap-2 rounded border-[#052326]/10">
                                <span className="truncate max-w-[120px]">{item.name}</span>
                                {item.status === 'uploading' ? (
                                    <span className="text-[#D4AF37] font-semibold">{item.progress}%</span>
                                ) : item.status === 'done' ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                    <X className="w-3.5 h-3.5 text-red-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedIds.length > 0 && (
                <div className="bg-[#052326]/5 p-3 border-b border-[#052326]/10 flex flex-row items-center justify-between">
                    <span className="text-sm font-medium text-[#052326]">{selectedIds.length} items selected</span>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="border-[#052326]/15 hover:bg-[#F8F3EF] gap-2">
                                    Move to...
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuItem onClick={() => handleBulkMove(null as any)}>
                                    <Folder className="w-4 h-4 mr-2" /> Root Folder
                                </DropdownMenuItem>
                                {folders.map(f => (
                                    <DropdownMenuItem key={f.id} onClick={() => handleBulkMove(f.id)}>
                                        <Folder className="w-4 h-4 mr-2" /> {f.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="sm" onClick={handleBulkDelete} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5">
                            <Trash2 className="w-4 h-4" /> Trash
                        </Button>

                        {isPicker && (
                            <Button size="sm" onClick={handleTriggerPickerSelect} className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 font-medium">
                                Select Selected ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* MAIN WORKSPACE: FILES & FOLDERS */}
            <div className="flex flex-grow flex-col lg:flex-row min-h-0">
                {/* GRID OR LIST CONTENT */}
                <div className="flex-grow p-4 overflow-y-auto">
                    {isLoading && mediaItems.length === 0 ? (
                        <div className="w-full h-[400px] flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
                        </div>
                    ) : mediaItems.length === 0 && folders.filter(f => currentFolderId === 'root' ? f.parent_id === null : f.parent_id === currentFolderId).length === 0 ? (
                        <div className="w-full h-[400px] flex flex-col items-center justify-center text-neutral-400">
                            <ImageIcon className="w-12 h-12 mb-3 text-neutral-300" />
                            <p className="text-sm">No files or folders here</p>
                            <p className="text-xs mt-1">Drag files here to upload them instantly</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* FOLDERS DIRECTORY LIST (Only visible if searching is not active) */}
                            {!searchQuery && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {folders
                                        .filter(f => currentFolderId === 'root' ? f.parent_id === null : f.parent_id === currentFolderId)
                                        .map(folder => (
                                            <div 
                                                key={folder.id}
                                                onClick={() => navigateToFolder(folder.id)}
                                                className="bg-white hover:bg-[#F8F3EF]/50 cursor-pointer p-3 flex items-center gap-3 transition-colors group"
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(85, 85, 85, 0.18)'
                                                }}
                                            >
                                                <Folder className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm font-medium text-[#052326] truncate">{folder.name}</p>
                                                    <p className="text-xs text-neutral-400">{folder.media_count || 0} files</p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {/* FILES LIST (GRID MODE) */}
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                                    {mediaItems.map(item => {
                                        const isSelected = selectedIds.includes(item.id);
                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'].includes(item.extension);
                                        const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(item.extension);

                                        return (
                                            <div 
                                                key={item.id}
                                                className={`bg-white group cursor-pointer overflow-hidden flex flex-col relative transition-all duration-300 ${isSelected ? 'ring-2 ring-[#D4AF37]' : ''}`}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(85, 85, 85, 0.18)'
                                                }}
                                                onClick={() => handleSelectFile(item.id)}
                                            >
                                                {/* Image Preview / File Type Icon */}
                                                <div className="aspect-square w-full bg-[#F8F3EF]/40 relative flex items-center justify-center border-b border-neutral-100 overflow-hidden">
                                                    {isImage ? (
                                                        <img 
                                                            src={imageKitHelpers.square(item.url)} 
                                                            alt={item.title || item.file_name} 
                                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                        />
                                                    ) : isVideo ? (
                                                        <div className="flex flex-col items-center text-[#052326]">
                                                            <Video className="w-8 h-8 text-[#D4AF37]" />
                                                            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mt-1">{item.extension}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center text-[#052326]">
                                                            <FileText className="w-8 h-8 text-neutral-400" />
                                                            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 mt-1">{item.extension}</span>
                                                        </div>
                                                    )}

                                                    {/* Selection indicator overlay */}
                                                    <div className={`absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 'bg-white/95 border-neutral-300 opacity-0 group-hover:opacity-100'}`}>
                                                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    </div>

                                                    {/* Utility Overlay Bar on Hover */}
                                                    <div className="absolute bottom-0 inset-x-0 bg-[#052326]/80 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1.5">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-white hover:bg-white/20 rounded"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyUrl(item.url, item.id);
                                                            }}
                                                        >
                                                            {copiedUrlId === item.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-white hover:bg-white/20 rounded"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveItem(item);
                                                            }}
                                                        >
                                                            <MoreVertical className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* File Meta Info */}
                                                <div className="p-2 flex-grow min-w-0">
                                                    <p className="text-xs font-medium text-[#052326] truncate" title={item.title || item.file_name}>
                                                        {item.title || item.file_name}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400 flex items-center justify-between mt-1">
                                                        <span>{formatBytes(item.size_bytes)}</span>
                                                        {item.width && <span>{item.width}x{item.height}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* FILES LIST (LIST MODE) */
                                <div className="bg-white overflow-hidden" style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)' }}>
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b">
                                                <th className="p-3 w-[40px]"></th>
                                                <th className="p-3">File Name</th>
                                                <th className="p-3">Extension</th>
                                                <th className="p-3">Dimensions</th>
                                                <th className="p-3">Size</th>
                                                <th className="p-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mediaItems.map(item => {
                                                const isSelected = selectedIds.includes(item.id);
                                                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'].includes(item.extension);
                                                
                                                return (
                                                    <tr 
                                                        key={item.id} 
                                                        className={`border-b hover:bg-[#F8F3EF]/10 cursor-pointer ${isSelected ? 'bg-[#D4AF37]/5' : ''}`}
                                                        onClick={() => handleSelectFile(item.id)}
                                                    >
                                                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox 
                                                                checked={isSelected} 
                                                                onCheckedChange={() => handleSelectFile(item.id)} 
                                                                className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                                                            />
                                                        </td>
                                                        <td className="p-3 font-medium text-[#052326] flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded overflow-hidden bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                                                {isImage ? (
                                                                    <img src={imageKitHelpers.thumbnail(item.url)} className="object-cover w-full h-full" />
                                                                ) : (
                                                                    <FileText className="w-4 h-4 text-neutral-400" />
                                                                )}
                                                            </div>
                                                            <span className="truncate max-w-[200px] sm:max-w-md">{item.title || item.file_name}</span>
                                                        </td>
                                                        <td className="p-3 text-neutral-500 uppercase">{item.extension}</td>
                                                        <td className="p-3 text-neutral-500">{item.width ? `${item.width} x ${item.height}` : '-'}</td>
                                                        <td className="p-3 text-neutral-500">{formatBytes(item.size_bytes)}</td>
                                                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-neutral-500 rounded-full"
                                                                    onClick={() => handleCopyUrl(item.url, item.id)}
                                                                >
                                                                    {copiedUrlId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-8 w-8 text-neutral-500 rounded-full"
                                                                    onClick={() => setActiveItem(item)}
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* PAGINATION CONTROLS */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t pt-4 border-neutral-100">
                                    <span className="text-xs text-neutral-500">Showing page {currentPage} of {totalPages} ({totalItems} total items)</span>
                                    <div className="flex items-center gap-1.5">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => fetchMedia(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            className="border-[#052326]/10"
                                        >
                                            Prev
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => fetchMedia(currentPage + 1)} 
                                            disabled={currentPage === totalPages}
                                            className="border-[#052326]/10"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* SIDEBAR DETAILS PANEL */}
                {activeItem && (
                    <div 
                        className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-[#052326]/10 bg-white p-4 flex flex-col flex-shrink-0"
                        style={{
                            borderTopRightRadius: '8px',
                            borderBottomRightRadius: '8px'
                        }}
                    >
                        <div className="flex items-center justify-between pb-3 border-b mb-4">
                            <h3 className="font-semibold text-[#052326]">File Details</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 rounded-full" onClick={() => setActiveItem(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-grow pr-1">
                            <div className="space-y-4 text-xs">
                                {/* Preview Card */}
                                <div className="w-full aspect-video bg-[#F8F3EF]/50 rounded overflow-hidden relative flex items-center justify-center border border-[#052326]/5">
                                    {['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'].includes(activeItem.extension) ? (
                                        <img src={imageKitHelpers.medium(activeItem.url)} className="object-contain w-full h-full" />
                                    ) : (
                                        <FileText className="w-12 h-12 text-neutral-400" />
                                    )}
                                </div>

                                {/* Main Actions */}
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-8 text-[11px] border-[#052326]/15 hover:bg-[#F8F3EF] gap-1.5"
                                        onClick={() => handleCopyUrl(activeItem.url, activeItem.id)}
                                    >
                                        <Link2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Copy URL
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full h-8 text-[11px] border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                                        onClick={() => handleSoftDelete(activeItem.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                                    </Button>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-neutral-500 block mb-1 font-semibold">Title</label>
                                        <Input 
                                            value={activeItem.title || ''} 
                                            onChange={(e) => handleUpdateMetadata(activeItem, { title: e.target.value })}
                                            className="h-8 text-xs border-[#052326]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-neutral-500 block mb-1 font-semibold">Alt Text</label>
                                        <Input 
                                            value={activeItem.alt_text || ''} 
                                            placeholder="SEO Description"
                                            onChange={(e) => handleUpdateMetadata(activeItem, { alt_text: e.target.value })}
                                            className="h-8 text-xs border-[#052326]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-neutral-500 block mb-1 font-semibold">Caption</label>
                                        <Input 
                                            value={activeItem.caption || ''} 
                                            onChange={(e) => handleUpdateMetadata(activeItem, { caption: e.target.value })}
                                            className="h-8 text-xs border-[#052326]/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-neutral-500 block mb-1 font-semibold">Description</label>
                                        <textarea 
                                            value={activeItem.description || ''} 
                                            rows={3}
                                            onChange={(e) => handleUpdateMetadata(activeItem, { description: e.target.value })}
                                            className="w-full p-2 text-xs border border-[#052326]/10 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#052326]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-neutral-500 block mb-1 font-semibold flex items-center gap-1"><Tags className="w-3 h-3 text-[#D4AF37]" /> Tags (comma-separated)</label>
                                        <Input 
                                            value={(activeItem.tags || []).join(', ')} 
                                            placeholder="CBD, Ayurveda, Banner"
                                            onChange={(e) => {
                                                const tagArray = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                                handleUpdateMetadata(activeItem, { tags: tagArray });
                                            }}
                                            className="h-8 text-xs border-[#052326]/10"
                                        />
                                    </div>
                                </div>

                                {/* Read-Only Stats */}
                                <div className="border-t pt-3 space-y-1.5 text-[11px] text-neutral-500">
                                    <div className="flex justify-between"><span className="font-medium text-neutral-400">File ID:</span> <span className="font-mono text-[10px] select-all truncate max-w-[180px]">{activeItem.file_id || '-'}</span></div>
                                    <div className="flex justify-between"><span className="font-medium text-neutral-400">Filename:</span> <span className="truncate max-w-[180px]">{activeItem.file_name}</span></div>
                                    <div className="flex justify-between"><span className="font-medium text-neutral-400">File Size:</span> <span>{formatBytes(activeItem.size_bytes)}</span></div>
                                    <div className="flex justify-between"><span className="font-medium text-neutral-400">Extension:</span> <span className="uppercase">{activeItem.extension}</span></div>
                                    {activeItem.width && (
                                        <div className="flex justify-between"><span className="font-medium text-neutral-400">Dimensions:</span> <span>{activeItem.width} x {activeItem.height} px</span></div>
                                    )}
                                    <div className="flex justify-between"><span className="font-medium text-neutral-400">Created:</span> <span>{new Date(activeItem.created_at).toLocaleDateString()}</span></div>
                                </div>

                                {/* Quick Image Transformations */}
                                {['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(activeItem.extension) && (
                                    <div className="border-t pt-3 space-y-2">
                                        <label className="text-neutral-500 block font-semibold">Transformations Previews</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <a href={imageKitHelpers.square(activeItem.url)} target="_blank" rel="noreferrer" className="bg-[#F8F3EF]/60 p-2 text-center rounded hover:bg-[#F8F3EF] border border-[#052326]/5 flex flex-col items-center">
                                                <span className="font-semibold text-neutral-700">Square Crop</span>
                                                <span className="text-[9px] text-neutral-400">500 x 500</span>
                                            </a>
                                            <a href={imageKitHelpers.grayscale(activeItem.url)} target="_blank" rel="noreferrer" className="bg-[#F8F3EF]/60 p-2 text-center rounded hover:bg-[#F8F3EF] border border-[#052326]/5 flex flex-col items-center">
                                                <span className="font-semibold text-neutral-700">Grayscale</span>
                                                <span className="text-[9px] text-neutral-400">B&W Style</span>
                                            </a>
                                            <a href={imageKitHelpers.rounded(activeItem.url, 20)} target="_blank" rel="noreferrer" className="bg-[#F8F3EF]/60 p-2 text-center rounded hover:bg-[#F8F3EF] border border-[#052326]/5 flex flex-col items-center">
                                                <span className="font-semibold text-neutral-700">Rounded Corner</span>
                                                <span className="text-[9px] text-neutral-400">Radius 20</span>
                                            </a>
                                            <a href={imageKitHelpers.blur(activeItem.url, 15)} target="_blank" rel="noreferrer" className="bg-[#F8F3EF]/60 p-2 text-center rounded hover:bg-[#F8F3EF] border border-[#052326]/5 flex flex-col items-center">
                                                <span className="font-semibold text-neutral-700">Blur Glow</span>
                                                <span className="text-[9px] text-neutral-400">Blur Intensity 15</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
    );
}
