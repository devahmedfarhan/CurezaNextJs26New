'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
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

    const [products, setProducts] = useState<any[]>([]);
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
        fact_checked_by: '',
        fact_checker_title: '',
        fact_checker_image: null as File | string | null,
        fact_checker_credentials: '',
        recommended_products: [] as number[],
        citations: [] as { title: string; url: string; source: string }[],
    });

    const groupedProducts = useMemo(() => {
        const groups: Record<string, typeof products> = {};
        products.forEach((product) => {
            const catName = typeof product.category === 'object' && product.category?.name
                ? product.category.name
                : 'Uncategorized';
            
            if (!groups[catName]) {
                groups[catName] = [];
            }
            groups[catName].push(product);
        });
        return groups;
    }, [products]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [postRes, categoriesRes, authorsRes, tagsRes, productsRes] = await Promise.all([
                api.get(`/admin/blog/posts/${id}`),
                api.get('/admin/blog/categories'),
                api.get('/admin/blog/authors'),
                api.get('/admin/blog/tags'),
                api.get('/admin/products/all?all=1'),
            ]);

            setCategories(categoriesRes.data);
            setAuthors(authorsRes.data);
            setAvailableTags(tagsRes.data);
            setProducts(productsRes.data?.data || []);

            const post = postRes.data;

            // Safe parsing helper for json fields that might come as strings from DB
            let recProducts = post.recommended_products;
            if (typeof recProducts === 'string') {
                try {
                    recProducts = JSON.parse(recProducts);
                } catch (e) {
                    recProducts = [];
                }
            }
            if (!Array.isArray(recProducts)) {
                recProducts = [];
            }

            let citations = post.citations;
            if (typeof citations === 'string') {
                try {
                    citations = JSON.parse(citations);
                } catch (e) {
                    citations = [];
                }
            }
            if (!Array.isArray(citations)) {
                citations = [];
            }

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
                fact_checked_by: post.fact_checked_by || '',
                fact_checker_title: post.fact_checker_title || '',
                fact_checker_image: post.fact_checker_image || '',
                fact_checker_credentials: post.fact_checker_credentials || '',
                recommended_products: recProducts,
                citations: citations,
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

            if (formData.fact_checked_by) {
                data.append('fact_checked_by', formData.fact_checked_by);
            }
            if (formData.fact_checker_title) {
                data.append('fact_checker_title', formData.fact_checker_title);
            }
            if (formData.fact_checker_credentials) {
                data.append('fact_checker_credentials', formData.fact_checker_credentials);
            }
            if (formData.fact_checker_image instanceof File) {
                data.append('fact_checker_image', formData.fact_checker_image);
            }
            data.append('recommended_products', JSON.stringify(formData.recommended_products));
            data.append('citations', JSON.stringify(formData.citations));

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

                    <div className="border rounded-lg p-4 space-y-4 bg-white">
                        <h3 className="font-semibold text-lg text-[#052326]">Fact-Checking & Reviewer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fact_checked_by">Reviewed By (Doctor Name)</Label>
                                <Input
                                    id="fact_checked_by"
                                    value={formData.fact_checked_by}
                                    onChange={(e) => setFormData({ ...formData, fact_checked_by: e.target.value })}
                                    placeholder="e.g. Dr. Anjali Sharma"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fact_checker_title">Reviewer Title/Degree</Label>
                                <Input
                                    id="fact_checker_title"
                                    value={formData.fact_checker_title}
                                    onChange={(e) => setFormData({ ...formData, fact_checker_title: e.target.value })}
                                    placeholder="e.g. BAMS, MD (Ayurveda)"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fact_checker_credentials">Reviewer Credentials & Bio</Label>
                            <Textarea
                                id="fact_checker_credentials"
                                value={formData.fact_checker_credentials}
                                onChange={(e) => setFormData({ ...formData, fact_checker_credentials: e.target.value })}
                                placeholder="e.g. 15+ years experience in clinical Panchakarma..."
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fact_checker_image">Reviewer Avatar</Label>
                            <Input
                                id="fact_checker_image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFormData({ ...formData, fact_checker_image: e.target.files[0] });
                                    }
                                }}
                            />
                            {formData.fact_checker_image && (
                                <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border">
                                    <img
                                        src={
                                            formData.fact_checker_image instanceof File
                                                ? URL.createObjectURL(formData.fact_checker_image)
                                                : (typeof formData.fact_checker_image === 'string' && formData.fact_checker_image.startsWith('/')
                                                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${formData.fact_checker_image}`
                                                    : formData.fact_checker_image)
                                        }
                                        alt="Reviewer Preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 space-y-4 bg-white">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-[#052326]">Citations & Scientific References</h3>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        citations: [...formData.citations, { title: '', url: '', source: '' }]
                                    });
                                }}
                            >
                                <Plus className="mr-1 h-3 w-3" /> Add Citation
                            </Button>
                        </div>
                        
                        {formData.citations.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No references added yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {formData.citations.map((citation, idx) => (
                                    <div key={idx} className="flex gap-3 items-end border-b pb-3 last:border-0 last:pb-0">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">Citation Title</Label>
                                            <Input
                                                value={citation.title}
                                                onChange={(e) => {
                                                    const updated = [...formData.citations];
                                                    updated[idx].title = e.target.value;
                                                    setFormData({ ...formData, citations: updated });
                                                }}
                                                placeholder="e.g. Clinical study of Amla"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs">URL (Optional)</Label>
                                            <Input
                                                value={citation.url}
                                                onChange={(e) => {
                                                    const updated = [...formData.citations];
                                                    updated[idx].url = e.target.value;
                                                    setFormData({ ...formData, citations: updated });
                                                }}
                                                placeholder="https://pubmed..."
                                            />
                                        </div>
                                        <div className="w-1/4 space-y-1">
                                            <Label className="text-xs">Source</Label>
                                            <Input
                                                value={citation.source}
                                                onChange={(e) => {
                                                    const updated = [...formData.citations];
                                                    updated[idx].source = e.target.value;
                                                    setFormData({ ...formData, citations: updated });
                                                }}
                                                placeholder="PubMed"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            size="icon"
                                            onClick={() => {
                                                const updated = formData.citations.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, citations: updated });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border rounded-lg p-4 space-y-4 bg-white">
                        <h3 className="font-semibold text-lg text-[#052326]">Recommended Products</h3>
                        <div className="space-y-2">
                            <Label>Select Products to Recommend (Grouped by Category)</Label>
                            <div className="space-y-6 max-h-96 overflow-y-auto p-3 border rounded-md bg-gray-50/50">
                                {Object.entries(groupedProducts).map(([categoryName, items]) => (
                                    <div key={categoryName} className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-cureza-green uppercase tracking-wider border-b pb-1 mb-2">
                                            {categoryName}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {items.map((product) => (
                                                <div 
                                                    key={product.id}
                                                    className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                                                        formData.recommended_products.includes(product.id)
                                                            ? "bg-cureza-green/10 border-cureza-green"
                                                            : "bg-white hover:bg-gray-50 border-gray-100"
                                                    }`}
                                                    onClick={() => {
                                                        const isSelected = formData.recommended_products.includes(product.id);
                                                        const updated = isSelected
                                                            ? formData.recommended_products.filter(id => id !== product.id)
                                                            : [...formData.recommended_products, product.id];
                                                        setFormData({ ...formData, recommended_products: updated });
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.recommended_products.includes(product.id)}
                                                        onChange={() => {}} // handled by div click
                                                        className="h-4 w-4 text-cureza-green border-gray-300 rounded focus:ring-cureza-green"
                                                    />
                                                    <span className="text-xs font-medium truncate">{product.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
