'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Author {
    id: number;
    name: string;
    slug: string;
    bio: string;
    image: string;
    social_links: any;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
}

export default function BlogAuthorsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        bio: '',
        image: '',
        social_links: '{}',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
    });

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blog/authors`);
            if (response.ok) {
                const data = await response.json();
                setAuthors(data);
            }
        } catch (error) {
            toast.error('Error fetching authors');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blog/authors/${editingId}`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blog/authors`;

            const method = editingId ? 'PUT' : 'POST';

            // Parse social_links JSON
            let socialLinksParsed = {};
            try {
                socialLinksParsed = JSON.parse(formData.social_links || '{}');
            } catch (e) {
                toast.error('Invalid JSON for social links');
                return;
            }

            const payload = {
                ...formData,
                social_links: socialLinksParsed,
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(`Author ${editingId ? 'updated' : 'created'} successfully`);
                fetchAuthors();
                setIsOpen(false);
                resetForm();
            } else {
                toast.error('Failed to save author');
            }
        } catch (error) {
            toast.error('Error saving author');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/blog/authors/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Author deleted successfully');
                fetchAuthors();
            } else {
                toast.error('Failed to delete author');
            }
        } catch (error) {
            toast.error('Error deleting author');
        }
    };

    const handleEdit = (author: Author) => {
        setEditingId(author.id);
        setFormData({
            name: author.name,
            slug: author.slug,
            bio: author.bio || '',
            image: author.image || '',
            social_links: JSON.stringify(author.social_links || {}, null, 2),
            meta_title: author.meta_title || '',
            meta_description: author.meta_description || '',
            meta_keywords: author.meta_keywords || '',
        });
        setIsOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            slug: '',
            bio: '',
            image: '',
            social_links: '{\n  "twitter": "",\n  "linkedin": ""\n}',
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
        });
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-black">Authors</h1>
                    <p className="text-gray-500 text-sm">Manage blog authors and their bio/SEO settings.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-black hover:bg-black/80 text-white rounded-[10px] border-none shadow-none font-medium text-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Author
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[10px] border-[0.5px] border-black/50 shadow-none max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base font-medium text-black">{editingId ? 'Edit Author' : 'Add Author'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <Label htmlFor="bio" className="text-xs font-medium text-gray-700">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={3}
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image" className="text-xs font-medium text-gray-700">Image URL</Label>
                                <Input
                                    id="image"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social_links" className="text-xs font-medium text-gray-700">Social Links (JSON)</Label>
                                <Textarea
                                    id="social_links"
                                    value={formData.social_links}
                                    onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
                                    rows={3}
                                    className="font-mono text-xs rounded-[10px] border-[0.5px] border-black/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
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
                                        placeholder="SEO Author Title"
                                        className="rounded-[10px] border-[0.5px] border-black/50 shadow-none text-xs font-normal focus-visible:ring-1 focus-visible:ring-black bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meta_description" className="text-[10px] font-medium text-gray-700">Meta Description</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        placeholder="SEO Author Description"
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
                                <Button type="submit" className="bg-black hover:bg-black/80 text-white rounded-[10px] border-none shadow-none font-medium text-sm w-full">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border-[0.5px] border-black/50 rounded-[10px] overflow-hidden bg-white shadow-none">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b-[0.5px] border-black/50">
                            <TableHead className="text-gray-500 font-medium text-xs">Name</TableHead>
                            <TableHead className="text-gray-500 font-medium text-xs">Slug</TableHead>
                            <TableHead className="text-gray-500 font-medium text-xs">Bio</TableHead>
                            <TableHead className="text-right text-gray-500 font-medium text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500 font-normal text-sm">Loading...</TableCell>
                            </TableRow>
                        ) : authors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500 font-normal text-sm">No authors found.</TableCell>
                            </TableRow>
                        ) : (
                            authors.map((author) => (
                                <TableRow key={author.id} className="border-b-[0.5px] border-black/50 hover:bg-gray-50/30">
                                    <TableCell className="font-medium text-sm text-black">{author.name}</TableCell>
                                    <TableCell className="text-gray-500 text-sm">{author.slug}</TableCell>
                                    <TableCell className="truncate max-w-xs text-gray-500 text-sm">{author.bio}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-[10px]" onClick={() => handleEdit(author)}>
                                            <Edit className="h-4 w-4 text-black" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 rounded-[10px] text-red-500" onClick={() => handleDelete(author.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
