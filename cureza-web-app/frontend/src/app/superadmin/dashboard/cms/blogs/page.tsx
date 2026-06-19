'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    category: { name: string };
    author: { name: string };
    status: string;
    published_at: string;
    views_count: number;
}

export default function BlogPostsPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/admin/blog/posts');
            setPosts(response.data.data);
        } catch (error) {
            toast.error('Error fetching blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await api.delete(`/admin/blog/posts/${id}`);
            toast.success('Blog post deleted successfully');
            fetchPosts();
        } catch (error) {
            toast.error('Error deleting blog post');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-black">Blog Posts</h1>
                    <p className="text-gray-500 text-sm">Manage your blog content here.</p>
                </div>
                <Link href="/superadmin/dashboard/cms/blogs/create">
                    <Button className="bg-black hover:bg-black/80 text-white rounded-[10px] border-none shadow-none font-medium text-sm">
                        <Plus className="mr-2 h-4 w-4" /> Create New Post
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm rounded-[10px] border-[0.5px] border-gray-200/50 shadow-none text-sm font-normal focus-visible:ring-1 focus-visible:ring-black"
                />
            </div>

            <div className="border-[0.5px] border-gray-200/50 rounded-[10px] overflow-hidden bg-white shadow-none">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-b-[0.5px] border-gray-200/50">
                            <TableHead className="text-gray-500 font-medium text-xs">Title</TableHead>
                            <TableHead className="text-gray-500 font-medium text-xs">Category</TableHead>
                            <TableHead className="text-gray-500 font-medium text-xs">Author</TableHead>
                            <TableHead className="text-gray-500 font-medium text-xs">Status</TableHead>
                            <TableHead className="text-gray-500 font-medium text-xs">Views</TableHead>
                            <TableHead className="text-right text-gray-500 font-medium text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-gray-500 font-normal text-sm">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredPosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-gray-500 font-normal text-sm">
                                    No posts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPosts.map((post) => (
                                <TableRow key={post.id} className="border-b-[0.5px] border-gray-200/50 hover:bg-gray-50/30">
                                    <TableCell className="font-normal text-sm text-black">{post.title}</TableCell>
                                    <TableCell className="text-gray-500 text-sm">{post.category?.name}</TableCell>
                                    <TableCell className="text-gray-500 text-sm">{post.author?.name}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="outline"
                                            className={`rounded-[10px] font-medium text-xs px-2 py-0.5 border-[0.5px] shadow-none ${
                                                post.status === 'published' 
                                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}
                                        >
                                            {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">{post.views_count}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/superadmin/dashboard/cms/blogs/${post.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-[10px]">
                                                <Edit className="h-4 w-4 text-black" />
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDelete(post.id)}
                                            className="h-8 w-8 hover:bg-red-50 rounded-[10px]"
                                        >
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
