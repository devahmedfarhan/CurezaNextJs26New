'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface MenuItem {
    id: number;
    title: string;
    url: string;
    parent_id: number | null;
    order: number;
    is_active: boolean;
    children?: MenuItem[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
    type: string;
}

export default function AdminMenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        parent_id: '' as string | number,
        order: 0,
        is_active: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [linkType, setLinkType] = useState<'custom' | 'category' | 'concern'>('custom');

    const fetchMenuItems = async () => {
        setIsLoading(true);
        try {
            const [menuRes, catRes] = await Promise.all([
                api.get('/admin/menu-items'),
                api.get('/admin/categories')
            ]);
            setMenuItems(menuRes.data);
            setCategories(catRes.data);
        } catch (error: any) {
            console.error('Failed to fetch data', error);
            showToast('Failed to load data. Check console for details.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const handleOpenModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                url: item.url || '',
                parent_id: item.parent_id || '',
                order: item.order,
                is_active: item.is_active
            });
            setLinkType('custom');
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                url: '',
                parent_id: '',
                order: 0,
                is_active: true
            });
            setLinkType('custom');
        }
        setIsModalOpen(true);
    };

    const handleLinkTypeChange = (type: 'custom' | 'category' | 'concern') => {
        setLinkType(type);
        setFormData({ ...formData, url: '' });
    };

    const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const slug = e.target.value;
        if (!slug) return;

        const type = linkType === 'category' ? 'category' : 'concern';
        const url = `/${type}/${slug}`;
        const category = categories.find(c => c.slug === slug);

        setFormData({
            ...formData,
            url,
            title: formData.title || (category ? category.name : '')
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            parent_id: formData.parent_id === '' ? null : Number(formData.parent_id)
        };

        try {
            if (editingItem) {
                await api.put(`/admin/menu-items/${editingItem.id}`, payload);
                showToast('Menu item updated successfully', 'success');
            } else {
                await api.post('/admin/menu-items', payload);
                showToast('Menu item created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to save menu item', error);
            showToast('Failed to save menu item', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure? This will delete all sub-items too.')) return;
        try {
            await api.delete(`/admin/menu-items/${id}`);
            showToast('Menu item deleted successfully', 'success');
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to delete menu item', error);
            showToast('Failed to delete menu item', 'error');
        }
    };

    const handleQuickAdd = async (title: string, url: string) => {
        try {
            await api.post('/admin/menu-items', {
                title,
                url,
                parent_id: null,
                order: menuItems.length + 1,
                is_active: true
            });
            showToast(`${title} added to menu`, 'success');
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to quick add item', error);
            showToast('Failed to add item', 'error');
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(menuItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setMenuItems(items);

        const reorderPayload = items.map((item, index) => ({
            id: item.id,
            order: index + 1
        }));

        try {
            await api.post('/admin/menu-items/reorder', { items: reorderPayload });
            showToast('Menu order updated', 'success');
        } catch (error) {
            console.error('Failed to reorder items', error);
            showToast('Failed to save new order', 'error');
            fetchMenuItems(); // Revert on error
        }
    };

    const getFlatItems = (items: MenuItem[], prefix = ''): { id: number, title: string }[] => {
        let flat: { id: number, title: string }[] = [];
        items.forEach(item => {
            flat.push({ id: item.id, title: prefix + item.title });
            if (item.children) {
                flat = [...flat, ...getFlatItems(item.children, prefix + '-- ')];
            }
        });
        return flat;
    };

    const flatItems = getFlatItems(menuItems);

    const renderItem = (item: MenuItem, depth = 0) => (
        <div key={item.id} className="border-b-[0.5px] border-black/50 last:border-0 bg-white">
            <div className={`flex items-center justify-between p-3 hover:bg-gray-50/50 ${depth > 0 ? 'bg-gray-50/20' : ''}`} style={{ paddingLeft: `${depth * 20 + 12}px` }}>
                <div className="flex items-center gap-3">
                    {depth === 0 && <GripVertical size={16} className="text-gray-400 cursor-grab" />}
                    <span className="font-normal text-sm text-black">{item.title}</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border-[0.5px] border-black/50 px-2 py-0.5 rounded-[10px]">{item.url}</span>
                    {!item.is_active && <span className="text-[10px] font-medium text-red-500 bg-red-50 border-[0.5px] border-black/50 px-2 py-0.5 rounded-[10px]">Inactive</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(item)} className="p-1 text-gray-400 hover:text-black transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            {item.children && item.children.map(child => renderItem(child, depth + 1))}
        </div>
    );

    const COMMON_PAGES = [
        { title: 'Home', url: '/' },
        { title: 'Shop All', url: '/shop' },
        { title: 'New Launches', url: '/new-launches' },
        { title: 'Bestsellers', url: '/bestsellers' },
        { title: 'Blog', url: '/blog' },
        { title: 'Offers', url: '/offers' },
        { title: 'About Us', url: '/about' },
        { title: 'Contact Us', url: '/contact' },
        { title: 'FAQ', url: '/faq' },
    ];

    return (
        <div className="w-full space-y-6 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-black tracking-tight">Menu Management</h1>
                    <p className="text-gray-500 text-sm">Manage desktop and mobile navigation links</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-[10px] hover:bg-black/80 transition-colors font-medium text-sm border-none shadow-none"
                >
                    <Plus size={18} /> Add Custom Item
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar: Available Items */}
                <div className="space-y-6">
                    {/* Pages */}
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden shadow-none">
                        <div className="p-3 border-b-[0.5px] border-black/50 bg-gray-50/50 font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Pages
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y-[0.5px] divide-gray-100">
                            {COMMON_PAGES.map((page, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50/30">
                                    <span className="text-sm text-gray-700 font-normal">{page.title}</span>
                                    <button
                                        onClick={() => handleQuickAdd(page.title, page.url)}
                                        className="text-xs bg-gray-50 hover:bg-black hover:text-white border-[0.5px] border-black/50 hover:border-black px-2 py-1 rounded-[10px] transition-colors flex items-center gap-1 font-medium"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden shadow-none">
                        <div className="p-3 border-b-[0.5px] border-black/50 bg-gray-50/50 font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Categories
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y-[0.5px] divide-gray-100">
                            {categories.filter(c => c.type === 'category').map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-3 hover:bg-gray-50/30">
                                    <span className="text-sm text-gray-700 font-normal">{cat.name}</span>
                                    <button
                                        onClick={() => handleQuickAdd(cat.name, `/category/${cat.slug}`)}
                                        className="text-xs bg-gray-50 hover:bg-black hover:text-white border-[0.5px] border-black/50 hover:border-black px-2 py-1 rounded-[10px] transition-colors flex items-center gap-1 font-medium"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Concerns */}
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden shadow-none">
                        <div className="p-3 border-b-[0.5px] border-black/50 bg-gray-50/50 font-medium text-xs text-gray-500 uppercase tracking-wider">
                            Concerns
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y-[0.5px] divide-gray-100">
                            {categories.filter(c => c.type === 'concern').map(concern => (
                                <div key={concern.id} className="flex items-center justify-between p-3 hover:bg-gray-50/30">
                                    <span className="text-sm text-gray-700 font-normal">{concern.name}</span>
                                    <button
                                        onClick={() => handleQuickAdd(concern.name, `/concern/${concern.slug}`)}
                                        className="text-xs bg-gray-50 hover:bg-black hover:text-white border-[0.5px] border-black/50 hover:border-black px-2 py-1 rounded-[10px] transition-colors flex items-center gap-1 font-medium"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Menu Structure */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden min-h-[500px] shadow-none">
                        <div className="p-4 border-b-[0.5px] border-black/50 bg-gray-50/50 font-medium text-xs text-gray-500 flex justify-between uppercase tracking-wider">
                            <span>Menu Structure</span>
                            <span>Actions</span>
                        </div>
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500 text-sm font-normal">Loading...</div>
                        ) : menuItems.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm font-normal">No menu items found. Add items from the left sidebar.</div>
                        ) : (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="menu-list">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {menuItems.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            {renderItem(item)}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b-[0.5px] border-black/50 flex justify-between items-center bg-white">
                            <h2 className="font-medium text-base text-black">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Link Type</label>
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-normal">
                                        <input
                                            type="radio"
                                            checked={linkType === 'custom'}
                                            onChange={() => handleLinkTypeChange('custom')}
                                            className="text-black accent-black"
                                        /> Custom URL
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-normal">
                                        <input
                                            type="radio"
                                            checked={linkType === 'category'}
                                            onChange={() => handleLinkTypeChange('category')}
                                            className="text-black accent-black"
                                        /> Category
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs text-gray-700 font-normal">
                                        <input
                                            type="radio"
                                            checked={linkType === 'concern'}
                                            onChange={() => handleLinkTypeChange('concern')}
                                            className="text-black accent-black"
                                        /> Concern
                                    </label>
                                </div>
                            </div>

                            {linkType === 'custom' ? (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                                    <input
                                        type="text"
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
                                        placeholder="/shop or https://..."
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Select {linkType === 'category' ? 'Category' : 'Concern'}</label>
                                    <select
                                        onChange={handleCategorySelect}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a {linkType}</option>
                                        {categories.filter(c => c.type === linkType).map(c => (
                                            <option key={c.id} value={c.slug}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Parent Item</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    <option value="">None (Top Level)</option>
                                    {flatItems.filter(i => i.id !== editingItem?.id).map(item => (
                                        <option key={item.id} value={item.id}>{item.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-black border-black/50 rounded focus:ring-black accent-black"
                                    />
                                    <label htmlFor="is_active" className="text-xs font-medium text-gray-700">Active</label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black hover:bg-black/80 text-white py-2.5 rounded-[10px] transition-colors font-medium text-sm border-none shadow-none disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
