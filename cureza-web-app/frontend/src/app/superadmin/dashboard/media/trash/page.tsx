'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, Check, Square } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/contexts/ToastContext";
import api from '@/lib/api';
import { imageKitHelpers } from '@/lib/imagekit';

interface MediaItem {
    id: number;
    file_id: string;
    url: string;
    thumbnail_url: string;
    file_name: string;
    size_bytes: number;
    extension: string;
    title: string | null;
    deleted_at: string;
}

export default function MediaTrash() {
    const { showToast } = useToast();
    const [trashedItems, setTrashedItems] = useState<MediaItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/media?trash=true');
            setTrashedItems(res.data.data);
        } catch (error) {
            showToast('Failed to load trashed media', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleRestore = async (id: number) => {
        try {
            await api.post(`/admin/media/${id}/restore`);
            setTrashedItems(prev => prev.filter(x => x.id !== id));
            setSelectedIds(prev => prev.filter(x => x !== id));
            showToast('Asset restored successfully', 'success');
        } catch (error) {
            showToast('Failed to restore asset', 'error');
        }
    };

    const handlePermanentDelete = async (id: number) => {
        if (!confirm('Warning: This will permanently delete the file from ImageKit and database. This action CANNOT be undone. Proceed?')) return;
        try {
            await api.delete(`/admin/media/${id}/force`);
            setTrashedItems(prev => prev.filter(x => x.id !== id));
            setSelectedIds(prev => prev.filter(x => x !== id));
            showToast('Asset permanently deleted', 'success');
        } catch (error) {
            showToast('Failed to permanently delete asset', 'error');
        }
    };

    const handleBulkAction = async (action: 'restore' | 'force_delete') => {
        if (selectedIds.length === 0) return;
        
        if (action === 'force_delete') {
            if (!confirm(`Warning: This will permanently delete ${selectedIds.length} assets from ImageKit and the database. This action CANNOT be undone. Proceed?`)) return;
        }

        try {
            await api.post('/admin/media/bulk', {
                action: action,
                ids: selectedIds
            });
            
            setTrashedItems(prev => prev.filter(x => !selectedIds.includes(x.id)));
            setSelectedIds([]);
            showToast(
                action === 'restore' 
                    ? 'Selected assets restored' 
                    : 'Selected assets permanently deleted', 
                'success'
            );
        } catch (error) {
            showToast(`Bulk ${action} operation failed`, 'error');
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
        <div className="w-full space-y-6 container mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#052326]">Media Trash</h1>
                    <p className="text-sm text-neutral-500 mt-1">Review, restore, or permanently purge deleted files from ImageKit storage</p>
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleBulkAction('restore')}
                            className="border-[#052326]/10 hover:bg-[#F8F3EF] gap-1.5"
                        >
                            <RotateCcw className="w-4 h-4 text-[#D4AF37]" /> Restore Selected
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleBulkAction('force_delete')}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" /> Purge Selected
                        </Button>
                    </div>
                )}
            </div>

            {/* TRASH GRID */}
            {isLoading ? (
                <div className="text-center py-12">Loading trashed files...</div>
            ) : trashedItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 bg-white border border-[#052326]/10 rounded-lg">
                    <Trash2 className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                    <p>Trash is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {trashedItems.map(item => {
                        const isSelected = selectedIds.includes(item.id);
                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'].includes(item.extension);

                        return (
                            <div 
                                key={item.id}
                                className={`bg-white group cursor-pointer overflow-hidden flex flex-col relative transition-all duration-300 ${isSelected ? 'ring-2 ring-[#D4AF37]' : ''}`}
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid rgba(85, 85, 85, 0.18)'
                                }}
                                onClick={() => handleSelect(item.id)}
                            >
                                {/* Checkbox Select Indicator */}
                                <div className={`absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center border z-10 transition-all ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-black' : 'bg-white/90 border-neutral-300'}`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>

                                {/* Preview */}
                                <div className="aspect-square w-full bg-neutral-50 relative flex items-center justify-center border-b overflow-hidden opacity-75 group-hover:opacity-100 transition-opacity">
                                    {isImage ? (
                                        <img src={imageKitHelpers.square(item.url)} className="object-cover w-full h-full" />
                                    ) : (
                                        <FileText className="w-8 h-8 text-neutral-400" />
                                    )}

                                    {/* Action Bar on Hover */}
                                    <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-white hover:bg-white/20 rounded"
                                            title="Restore"
                                            onClick={() => handleRestore(item.id)}
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-red-400 hover:bg-red-500/20 rounded"
                                            title="Permanently Delete"
                                            onClick={() => handlePermanentDelete(item.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="p-2 flex-grow min-w-0">
                                    <p className="text-xs font-medium text-[#052326] truncate">{item.title || item.file_name}</p>
                                    <p className="text-[10px] text-neutral-400 mt-1">{formatBytes(item.size_bytes)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
