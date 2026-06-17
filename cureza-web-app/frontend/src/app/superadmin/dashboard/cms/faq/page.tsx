'use client';

import { useState, useEffect } from 'react';
import { 
    Plus, Edit, Trash2, Save, X, HelpCircle, Loader2, 
    ArrowLeft, LayoutGrid, Home, MessageSquare, ChevronRight,
    ShoppingBag, Truck, RefreshCw, User, CreditCard, Gift, ShieldCheck, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface FaqItem {
    id: number;
    category: 'help' | 'home';
    topic_id?: string;
    topic_title?: string;
    topic_icon?: string;
    topic_description?: string;
    subtopic_id?: string;
    subtopic_title?: string;
    question: string;
    answer: string;
    order: number;
}

// Icon list map for Help Center topics
const AVAILABLE_ICONS = [
    { name: 'ShoppingBag', component: ShoppingBag },
    { name: 'Truck', component: Truck },
    { name: 'RefreshCw', component: RefreshCw },
    { name: 'User', component: User },
    { name: 'CreditCard', component: CreditCard },
    { name: 'Gift', component: Gift },
    { name: 'ShieldCheck', component: ShieldCheck },
    { name: 'MessageCircle', component: MessageCircle },
    { name: 'HelpCircle', component: HelpCircle }
];

export default function AdminFaqManagerPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'help' | 'home'>('help');
    const { showToast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

    // Form fields
    const [formData, setFormData] = useState({
        category: 'help' as 'help' | 'home',
        topic_mode: 'existing' as 'existing' | 'new',
        topic_id: '',
        topic_title: '',
        topic_icon: 'HelpCircle',
        topic_description: '',
        subtopic_mode: 'existing' as 'existing' | 'new',
        subtopic_id: '',
        subtopic_title: '',
        question: '',
        answer: '',
        order: 0
    });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/faqs');
            setFaqs(res.data);
        } catch (err: any) {
            showToast('Failed to fetch FAQs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Extract unique topics and subtopics for dropdowns
    const uniqueTopics = faqs
        .filter(f => f.category === 'help')
        .reduce((acc: any[], current) => {
            if (current.topic_id && !acc.some(t => t.id === current.topic_id)) {
                acc.push({
                    id: current.topic_id,
                    title: current.topic_title,
                    icon: current.topic_icon,
                    description: current.topic_description
                });
            }
            return acc;
        }, []);

    const uniqueSubtopics = faqs
        .filter(f => f.category === 'help' && f.topic_id === formData.topic_id)
        .reduce((acc: any[], current) => {
            if (current.subtopic_id && !acc.some(s => s.id === current.subtopic_id)) {
                acc.push({
                    id: current.subtopic_id,
                    title: current.subtopic_title
                });
            }
            return acc;
        }, []);

    const handleOpenModal = (faq?: FaqItem) => {
        if (faq) {
            setEditingFaq(faq);
            setFormData({
                category: faq.category,
                topic_mode: 'existing',
                topic_id: faq.topic_id || '',
                topic_title: faq.topic_title || '',
                topic_icon: faq.topic_icon || 'HelpCircle',
                topic_description: faq.topic_description || '',
                subtopic_mode: 'existing',
                subtopic_id: faq.subtopic_id || '',
                subtopic_title: faq.subtopic_title || '',
                question: faq.question,
                answer: faq.answer,
                order: faq.order
            });
        } else {
            setEditingFaq(null);
            // Default to first existing topic if available
            const defaultTopic = uniqueTopics[0]?.id || '';
            const defaultTopicTitle = uniqueTopics[0]?.title || '';
            const defaultTopicIcon = uniqueTopics[0]?.icon || 'HelpCircle';
            const defaultTopicDesc = uniqueTopics[0]?.description || '';
            
            setFormData({
                category: activeTab,
                topic_mode: 'existing',
                topic_id: defaultTopic,
                topic_title: defaultTopicTitle,
                topic_icon: defaultTopicIcon,
                topic_description: defaultTopicDesc,
                subtopic_mode: 'existing',
                subtopic_id: '',
                subtopic_title: '',
                question: '',
                answer: '',
                order: faqs.filter(f => f.category === activeTab).length + 1
            });
        }
        setIsModalOpen(true);
    };

    const handleTopicChange = (topicId: string) => {
        if (topicId === '__new__') {
            setFormData(prev => ({
                ...prev,
                topic_mode: 'new',
                topic_id: '',
                topic_title: '',
                topic_icon: 'HelpCircle',
                topic_description: '',
                subtopic_mode: 'new',
                subtopic_id: '',
                subtopic_title: ''
            }));
        } else {
            const selectedTopic = uniqueTopics.find(t => t.id === topicId);
            setFormData(prev => ({
                ...prev,
                topic_mode: 'existing',
                topic_id: topicId,
                topic_title: selectedTopic ? selectedTopic.title : '',
                topic_icon: selectedTopic ? selectedTopic.icon : 'HelpCircle',
                topic_description: selectedTopic ? selectedTopic.description : '',
                subtopic_mode: 'existing',
                subtopic_id: '',
                subtopic_title: ''
            }));
        }
    };

    const handleSubtopicChange = (subtopicId: string) => {
        if (subtopicId === '__new__') {
            setFormData(prev => ({
                ...prev,
                subtopic_mode: 'new',
                subtopic_id: '',
                subtopic_title: ''
            }));
        } else {
            const selectedSub = uniqueSubtopics.find(s => s.id === subtopicId);
            setFormData(prev => ({
                ...prev,
                subtopic_mode: 'existing',
                subtopic_id: subtopicId,
                subtopic_title: selectedSub ? selectedSub.title : ''
            }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Prepare request body
        const payload: any = {
            category: formData.category,
            question: formData.question,
            answer: formData.answer,
            order: formData.order
        };

        if (formData.category === 'help') {
            payload.topic_id = formData.topic_mode === 'new' 
                ? formData.topic_title.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                : formData.topic_id;
            payload.topic_title = formData.topic_title;
            payload.topic_icon = formData.topic_icon;
            payload.topic_description = formData.topic_description;

            payload.subtopic_id = formData.subtopic_mode === 'new' 
                ? formData.subtopic_title.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                : formData.subtopic_id;
            payload.subtopic_title = formData.subtopic_title;
        }

        try {
            if (editingFaq) {
                await api.put(`/admin/faqs/${editingFaq.id}`, payload);
                showToast('FAQ updated successfully!', 'success');
            } else {
                await api.post('/admin/faqs', payload);
                showToast('FAQ created successfully!', 'success');
            }
            setIsModalOpen(false);
            fetchFaqs();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to save FAQ.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) {
            return;
        }

        try {
            await api.delete(`/admin/faqs/${id}`);
            showToast('FAQ deleted successfully!', 'success');
            fetchFaqs();
        } catch (err: any) {
            showToast('Failed to delete FAQ.', 'error');
        }
    };

    // Filter FAQs by category
    const filteredFaqs = faqs.filter(f => f.category === activeTab);

    // Group Help Center FAQs by Topic -> Subtopic for organized listing
    const helpCenterGroups: { [topicId: string]: { title: string; icon: string; subtopics: { [subId: string]: { title: string; items: FaqItem[] } } } } = {};
    if (activeTab === 'help') {
        filteredFaqs.forEach(faq => {
            const topicId = faq.topic_id || 'unassigned';
            const subId = faq.subtopic_id || 'unassigned';

            if (!helpCenterGroups[topicId]) {
                helpCenterGroups[topicId] = {
                    title: faq.topic_title || 'Unassigned Topic',
                    icon: faq.topic_icon || 'HelpCircle',
                    subtopics: {}
                };
            }

            if (!helpCenterGroups[topicId].subtopics[subId]) {
                helpCenterGroups[topicId].subtopics[subId] = {
                    title: faq.subtopic_title || 'Unassigned Subtopic',
                    items: []
                };
            }

            helpCenterGroups[topicId].subtopics[subId].items.push(faq);
        });
    }

    if (loading) {
        return (
            <div className="max-w-4xl space-y-6 flex flex-col justify-center items-center py-20">
                <Loader2 className="animate-spin text-cureza-green" size={40} />
                <p className="text-gray-500 font-medium animate-pulse">Loading FAQ Manager...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/superadmin/dashboard/cms"
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">FAQ & Help Manager</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage static FAQs for the Homepage and Help Center pages</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-cureza-green hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm shadow-sm transition-all"
                >
                    <Plus size={16} />
                    Add FAQ Item
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 gap-2">
                <button
                    onClick={() => setActiveTab('help')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'help' 
                            ? 'border-cureza-green text-cureza-green bg-green-50/50 rounded-t-lg' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <LayoutGrid size={16} />
                    Help Center Pages
                </button>
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'home' 
                            ? 'border-cureza-green text-cureza-green bg-green-50/50 rounded-t-lg' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <Home size={16} />
                    Homepage FAQs
                </button>
            </div>

            {/* Content list */}
            {activeTab === 'home' ? (
                // Home FAQs List View
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-150">
                    {filteredFaqs.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 italic">No homepage FAQs found. Add one now!</div>
                    ) : (
                        filteredFaqs.map((faq) => (
                            <div key={faq.id} className="p-5 flex justify-between items-start gap-4 hover:bg-gray-50/30 transition-colors">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                            Order: {faq.order}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm">Q: {faq.question}</h4>
                                    <p className="text-xs text-gray-600 font-light pr-10">{faq.answer}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(faq)}
                                        className="p-2 text-cureza-green hover:bg-green-50 border border-green-200/50 rounded-lg transition-colors"
                                        title="Edit FAQ"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(faq.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 border border-red-200/50 rounded-lg transition-colors"
                                        title="Delete FAQ"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                // Help Center Nested Groups
                <div className="space-y-6">
                    {Object.keys(helpCenterGroups).length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 italic">
                            No Help Center FAQs found. Add one now!
                        </div>
                    ) : (
                        Object.keys(helpCenterGroups).map(topicId => {
                            const topic = helpCenterGroups[topicId];
                            const TopicIcon = AVAILABLE_ICONS.find(i => i.name === topic.icon)?.component || HelpCircle;
                            
                            return (
                                <div key={topicId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    {/* Topic Header */}
                                    <div className="bg-[#052326] text-white p-5 flex items-center justify-between gap-4 border-b border-emerald-950">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-lg text-[#F0C417]">
                                                <TopicIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-sm tracking-wide">{topic.title}</h3>
                                                <p className="text-[10px] text-white/60 font-light mt-0.5">Slug ID: {topicId}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtopics and items */}
                                    <div className="divide-y divide-gray-150">
                                        {Object.keys(topic.subtopics).map(subId => {
                                            const sub = topic.subtopics[subId];
                                            return (
                                                <div key={subId} className="p-5">
                                                    <h4 className="font-bold text-xs text-cureza-green uppercase tracking-wider mb-3 bg-green-50/70 inline-block px-2.5 py-1 rounded-md border border-green-100">
                                                        {sub.title} ({subId})
                                                    </h4>
                                                    
                                                    <div className="space-y-3 mt-2 divide-y divide-gray-100">
                                                        {sub.items.map((faq, idx) => (
                                                            <div key={faq.id} className={`flex justify-between items-start gap-4 pt-3 ${idx === 0 ? 'pt-0 border-t-0' : ''}`}>
                                                                <div className="space-y-1 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-bold text-gray-400">Order: {faq.order}</span>
                                                                    </div>
                                                                    <h5 className="font-bold text-gray-800 text-xs">Q: {faq.question}</h5>
                                                                    <p className="text-[11px] text-gray-500 font-light pr-10">{faq.answer}</p>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <button 
                                                                        onClick={() => handleOpenModal(faq)}
                                                                        className="p-1.5 text-cureza-green hover:bg-green-50 border border-green-200/50 rounded-lg transition-colors"
                                                                        title="Edit FAQ"
                                                                    >
                                                                        <Edit size={12} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(faq.id)}
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200/50 rounded-lg transition-colors"
                                                                        title="Delete FAQ"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden border border-gray-100">
                        {/* Modal Header */}
                        <div className="bg-[#052326] text-white p-4 flex justify-between items-center">
                            <h2 className="font-bold text-base tracking-wide">
                                {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Display Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'help' | 'home' }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="help">Help Center Support Pages</option>
                                    <option value="home">Homepage FAQs Block</option>
                                </select>
                            </div>

                            {formData.category === 'help' && (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1.5">Help Center Categorization</h4>
                                    
                                    {/* Topic Selection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Topic</label>
                                            <select
                                                value={formData.topic_mode === 'new' ? '__new__' : formData.topic_id}
                                                onChange={(e) => handleTopicChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                                            >
                                                {uniqueTopics.map(t => (
                                                    <option key={t.id} value={t.id}>{t.title}</option>
                                                ))}
                                                <option value="__new__">+ Create New Topic...</option>
                                            </select>
                                        </div>

                                        {formData.topic_mode === 'new' && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">New Topic Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Account Security"
                                                    value={formData.topic_title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, topic_title: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Topic Meta if new */}
                                    {formData.topic_mode === 'new' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="sm:col-span-1">
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Topic Icon</label>
                                                <select
                                                    value={formData.topic_icon}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, topic_icon: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                                                >
                                                    {AVAILABLE_ICONS.map(i => (
                                                        <option key={i.name} value={i.name}>{i.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Topic Description</label>
                                                <input
                                                    type="text"
                                                    placeholder="Short summary of this topic..."
                                                    value={formData.topic_description}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, topic_description: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Subtopic Selection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Subtopic</label>
                                            <select
                                                value={formData.subtopic_mode === 'new' ? '__new__' : formData.subtopic_id}
                                                onChange={(e) => handleSubtopicChange(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
                                                disabled={formData.topic_mode === 'new'}
                                            >
                                                <option value="" disabled>Select Subtopic</option>
                                                {uniqueSubtopics.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                                <option value="__new__">+ Create New Subtopic...</option>
                                            </select>
                                        </div>

                                        {(formData.subtopic_mode === 'new' || formData.topic_mode === 'new') && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">New Subtopic Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Password Management"
                                                    value={formData.subtopic_title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, subtopic_title: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Question Text</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Enter FAQ question..."
                                    value={formData.question}
                                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-white text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Answer Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Enter detailed answer..."
                                    value={formData.answer}
                                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none bg-white text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cureza-green"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full mt-4 bg-cureza-green text-white py-2.5 rounded-lg hover:bg-green-700 font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save FAQ Item
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
