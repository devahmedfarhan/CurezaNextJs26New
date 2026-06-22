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

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    posts_count?: number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/blog/categories');
            setCategories(res.data);
        } catch (error) {
            toast.error('Failed to fetch categories');
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
            await api.post('/admin/blog/categories', formData);
            toast.success('Category created successfully');
            setIsCreateOpen(false);
            setFormData({ name: '', slug: '', description: '', meta_title: '', meta_description: '', meta_keywords: '' });
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    const handleEditClick = (category: Category) => {
        setCurrentCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            meta_title: category.meta_title || '',
            meta_description: category.meta_description || '',
            meta_keywords: category.meta_keywords || '',
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCategory) return;

        try {
            await api.put(`/admin/blog/categories/${currentCategory.id}`, formData);
            toast.success('Category updated successfully');
            setIsEditOpen(false);
            setCurrentCategory(null);
            setFormData({ name: '', slug: '', description: '', meta_title: '', meta_description: '', meta_keywords: '' });
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await api.delete(`/admin/blog/categories/${id}`);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-black">Categories</h1>
                    <p className="text-gray-500 text-sm">Manage blog categories and their SEO settings.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setFormData({ name: '', slug: '', description: '', meta_title: '', meta_description: '', meta_keywords: '' });
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-black hover:bg-black/80 text-white rounded-[10px] border-none shadow-none font-medium text-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[10px] border-[0.5px] border-black/50 shadow-none max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base font-medium text-black">Create Category</DialogTitle>
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
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-medium text-gray-700">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
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
                                        placeholder="SEO Category Title"
                                        className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_description" className="text-[10px] font-medium text-gray-700">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        placeholder="SEO Category Description"
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
                        placeholder="Search categories..."
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
                            <TableHead className="text-gray-500 font-medium text-xs">Description</TableHead>
                            <TableHead className="text-right text-gray-500 font-medium text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500 font-normal text-sm">Loading...</TableCell>
                            </TableRow>
                        ) : filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500 font-normal text-sm">No categories found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories.map((category) => (
                                <TableRow key={category.id} className="border-b-[0.5px] border-black/50 hover:bg-gray-50/30">
                                    <TableCell className="font-normal text-sm text-black">{category.name}</TableCell>
                                    <TableCell className="text-gray-500 text-sm">{category.slug}</TableCell>
                                    <TableCell className="max-w-md truncate text-gray-500 text-sm">{category.description || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-[10px]" onClick={() => handleEditClick(category)}>
                                                <Pencil className="h-4 w-4 text-black" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 rounded-[10px] text-red-500" onClick={() => handleDelete(category.id)}>
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
                    setCurrentCategory(null);
                    setFormData({ name: '', slug: '', description: '', meta_title: '', meta_description: '', meta_keywords: '' });
                }
            }}>
                <DialogContent className="rounded-[10px] border-[0.5px] border-black/50 shadow-none max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-medium text-black">Edit Category</DialogTitle>
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
                        <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-xs font-medium text-gray-700">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
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
                                    placeholder="SEO Category Title"
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-meta_description" className="text-[10px] font-medium text-gray-700">Meta Description</Label>
                                <Textarea
                                    id="edit-meta_description"
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                    placeholder="SEO Category Description"
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
