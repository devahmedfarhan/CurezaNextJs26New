'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import TiptapEditor from '@/components/TiptapEditor';

interface Category {
    id: number;
    name: string;
}

interface Author {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: null as File | string | null,
        category_id: '',
        author_id: '',
        status: 'draft',
        is_featured: false,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        published_at: '',
        tags: [] as number[],
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [postRes, categoriesRes, authorsRes, tagsRes] = await Promise.all([
                api.get(`/admin/blog/posts/${id}`),
                api.get('/admin/blog/categories'),
                api.get('/admin/blog/authors'),
                api.get('/admin/blog/tags'),
            ]);

            setCategories(categoriesRes.data);
            setAuthors(authorsRes.data);
            setAvailableTags(tagsRes.data);

            const post = postRes.data;
            setFormData({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || '',
                content: post.content,
                featured_image: post.featured_image || '',
                category_id: post.category_id.toString(),
                author_id: post.author_id.toString(),
                status: post.status,
                is_featured: post.is_featured,
                meta_title: post.meta_title || '',
                meta_description: post.meta_description || '',
                meta_keywords: post.meta_keywords || '',
                published_at: post.published_at || '',
                tags: post.tags ? post.tags.map((tag: any) => tag.id) : [],
            });
        } catch (error) {
            toast.error('Error loading data');
            router.push('/superadmin/dashboard/cms/blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();
            data.append('_method', 'PUT'); // Method spoofing for Laravel to handle file upload on PUT
            data.append('title', formData.title);
            data.append('slug', formData.slug);
            data.append('excerpt', formData.excerpt);
            data.append('content', formData.content);
            data.append('category_id', formData.category_id);
            data.append('author_id', formData.author_id);
            data.append('status', formData.status);
            data.append('is_featured', formData.is_featured ? '1' : '0');
            data.append('meta_title', formData.meta_title);
            data.append('meta_description', formData.meta_description);
            data.append('meta_keywords', formData.meta_keywords);

            if (formData.published_at) {
                data.append('published_at', formData.published_at);
            } else if (formData.status === 'published') {
                data.append('published_at', new Date().toISOString());
            }

            if (formData.featured_image instanceof File) {
                data.append('featured_image', formData.featured_image);
            }

            // Append arrays
            formData.tags.forEach(tagId => {
                data.append('tags[]', tagId.toString());
            });

            // Use POST with _method=PUT
            await api.post(`/admin/blog/posts/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Blog post updated successfully');
            router.push('/superadmin/dashboard/cms/blogs');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update blog post';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/superadmin/dashboard/cms/blogs">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
                        <p className="text-muted-foreground">Update content and settings.</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Update Post'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter post title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="url-friendly-slug"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <TiptapEditor
                            content={formData.content}
                            onChange={(content) => setFormData({ ...formData, content })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, excerpt: e.target.value })}
                            placeholder="Short summary of the post..."
                            rows={3}
                        />
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                        <h3 className="font-semibold">SEO Settings</h3>
                        <div className="space-y-2">
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input
                                id="meta_title"
                                value={formData.meta_title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, meta_title: e.target.value })}
                                placeholder="SEO Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta_description">Meta Description</Label>
                            <Textarea
                                id="meta_description"
                                value={formData.meta_description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, meta_description: e.target.value })}
                                placeholder="SEO Description"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta_keywords">Meta Keywords</Label>
                            <Input
                                id="meta_keywords"
                                value={formData.meta_keywords}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border rounded-lg p-4 space-y-4 bg-white">
                        <h3 className="font-semibold">Publishing</h3>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: string) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="is_featured">Featured Post</Label>
                            <Switch
                                id="is_featured"
                                checked={formData.is_featured}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_featured: checked })}
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4 bg-white">
                        <h3 className="font-semibold">Organization</h3>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value: string) => setFormData({ ...formData, category_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Author</Label>
                            <Select
                                value={formData.author_id}
                                onValueChange={(value: string) => setFormData({ ...formData, author_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select author" />
                                </SelectTrigger>
                                <SelectContent>
                                    {authors.map((author) => (
                                        <SelectItem key={author.id} value={author.id.toString()}>
                                            {author.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant={formData.tags.includes(tag.id) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            const newTags = formData.tags.includes(tag.id)
                                                ? formData.tags.filter(id => id !== tag.id)
                                                : [...formData.tags, tag.id];
                                            setFormData({ ...formData, tags: newTags });
                                        }}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4 bg-white">
                        <h3 className="font-semibold">Featured Image</h3>
                        <div className="space-y-2">
                            <Label htmlFor="featured_image">Featured Image</Label>
                            <Input
                                id="featured_image"
                                type="file"
                                accept="image/*"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFormData({ ...formData, featured_image: e.target.files[0] });
                                    }
                                }}
                            />
                        </div>
                        {formData.featured_image && (
                            <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border">
                                <img
                                    src={
                                        formData.featured_image instanceof File
                                            ? URL.createObjectURL(formData.featured_image)
                                            : (typeof formData.featured_image === 'string' && formData.featured_image.startsWith('/')
                                                ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${formData.featured_image}`
                                                : formData.featured_image)
                                    }
                                    alt="Preview"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
