'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Tag {
    id: number;
    name: string;
    slug: string;
    posts_count?: number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState<Tag | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
    });

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await api.get('/admin/blog/tags');
            setTags(res.data);
        } catch (error) {
            toast.error('Failed to fetch tags');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData({ ...formData, name, slug });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/blog/tags', formData);
            toast.success('Tag created successfully');
            setIsCreateOpen(false);
            setFormData({ name: '', slug: '', meta_title: '', meta_description: '', meta_keywords: '' });
            fetchTags();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create tag');
        }
    };

    const handleEditClick = (tag: Tag) => {
        setCurrentTag(tag);
        setFormData({
            name: tag.name,
            slug: tag.slug,
            meta_title: tag.meta_title || '',
            meta_description: tag.meta_description || '',
            meta_keywords: tag.meta_keywords || '',
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTag) return;

        try {
            await api.put(`/admin/blog/tags/${currentTag.id}`, formData);
            toast.success('Tag updated successfully');
            setIsEditOpen(false);
            setCurrentTag(null);
            setFormData({ name: '', slug: '', meta_title: '', meta_description: '', meta_keywords: '' });
            fetchTags();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update tag');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tag?')) return;

        try {
            await api.delete(`/admin/blog/tags/${id}`);
            toast.success('Tag deleted successfully');
            fetchTags();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete tag');
        }
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-black">Tags</h1>
                    <p className="text-gray-500 text-sm">Manage blog tags and their SEO settings.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setFormData({ name: '', slug: '', meta_title: '', meta_description: '', meta_keywords: '' });
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-black hover:bg-black/80 text-white rounded-[10px] border-none shadow-none font-medium text-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Tag
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[10px] border-[0.5px] border-black/50 shadow-none max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base font-medium text-black">Create Tag</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-medium text-gray-700">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-xs font-medium text-gray-700">Slug</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                                />
                            </div>
                            
                            <div className="border-[0.5px] border-black/50 p-4 rounded-[10px] space-y-4 bg-gray-50/30">
                                <h4 className="font-medium text-xs text-black">SEO Settings</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_title" className="text-[10px] font-medium text-gray-700">Meta Title</Label>
                                    <Input
                                        id="meta_title"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        placeholder="SEO Tag Title"
                                        className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_description" className="text-[10px] font-medium text-gray-700">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        placeholder="SEO Tag Description"
                                        rows={2}
                                        className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_keywords" className="text-[10px] font-medium text-gray-700">Meta Keywords</Label>
                                    <Input
                                        id="meta_keywords"
                                        value={formData.meta_keywords}
                                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                        placeholder="keyword1, keyword2"
                                        className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="submit" className="bg-black hover:bg-black/80 text-white rounded-[10px] border-none shadow-none font-medium text-sm w-full">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search tags..."
                        className="pl-9 rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="border-[0.5px] border-black/50 rounded-[10px] overflow-hidden bg-white shadow-none">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b-[0.5px] border-black/50">
                            <TableHead className="text-gray-500 font-medium text-xs">Name</TableHead>
                            <TableHead className="text-gray-500 font-medium text-xs">Slug</TableHead>
                            <TableHead className="text-right text-gray-500 font-medium text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10 text-gray-500 font-normal text-sm">Loading...</TableCell>
                            </TableRow>
                        ) : filteredTags.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-10 text-gray-500 font-normal text-sm">No tags found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredTags.map((tag) => (
                                <TableRow key={tag.id} className="border-b-[0.5px] border-black/50 hover:bg-gray-50/30">
                                    <TableCell className="font-normal text-sm text-black">{tag.name}</TableCell>
                                    <TableCell className="text-gray-500 text-sm">{tag.slug}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-[10px]" onClick={() => handleEditClick(tag)}>
                                                <Pencil className="h-4 w-4 text-black" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 rounded-[10px] text-red-500" onClick={() => handleDelete(tag.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) {
                    setCurrentTag(null);
                    setFormData({ name: '', slug: '', meta_title: '', meta_description: '', meta_keywords: '' });
                }
            }}>
                <DialogContent className="rounded-[10px] border-[0.5px] border-black/50 shadow-none max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-medium text-black">Edit Tag</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-xs font-medium text-gray-700">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={handleNameChange}
                                required
                                className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-slug" className="text-xs font-medium text-gray-700">Slug</Label>
                            <Input
                                id="edit-slug"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                required
                                className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                            />
                        </div>
                        
                        <div className="border-[0.5px] border-black/50 p-4 rounded-[10px] space-y-4 bg-gray-50/30">
                            <h4 className="font-medium text-xs text-black">SEO Settings</h4>
                            <div className="space-y-2">
                                <Label htmlFor="edit-meta_title" className="text-[10px] font-medium text-gray-700">Meta Title</Label>
                                <Input
                                    id="edit-meta_title"
                                    value={formData.meta_title}
                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                    placeholder="SEO Tag Title"
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-meta_description" className="text-[10px] font-medium text-gray-700">Meta Description</Label>
                                <Textarea
                                    id="edit-meta_description"
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    placeholder="SEO Tag Description"
                                    rows={2}
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-meta_keywords" className="text-[10px] font-medium text-gray-700">Meta Keywords</Label>
                                <Input
                                    id="edit-meta_keywords"
                                    value={formData.meta_keywords}
                                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                    placeholder="keyword1, keyword2"
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="submit" className="bg-black hover:bg-black/80 text-white rounded-[10px] border-none shadow-none font-medium text-sm w-full">Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
