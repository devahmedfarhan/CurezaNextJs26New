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
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Authors</h1>
                    <p className="text-muted-foreground">Manage blog authors.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Author
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Author' : 'Add Author'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Image URL</Label>
                                <Input
                                    id="image"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="social_links">Social Links (JSON)</Label>
                                <Textarea
                                    id="social_links"
                                    value={formData.social_links}
                                    onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
                                    rows={4}
                                    className="font-mono text-sm"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Bio</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : authors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">No authors found.</TableCell>
                            </TableRow>
                        ) : (
                            authors.map((author) => (
                                <TableRow key={author.id}>
                                    <TableCell className="font-medium">{author.name}</TableCell>
                                    <TableCell>{author.slug}</TableCell>
                                    <TableCell className="truncate max-w-xs">{author.bio}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(author)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(author.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
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
