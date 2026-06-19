'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Smartphone, Zap, ToggleLeft, ToggleRight, Plus, X, Info, HelpCircle, Code, Edit2, Play } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Automation {
    id: number;
    name: string;
    channel: 'WhatsApp' | 'SMS';
    trigger: string;
    messageTemplate: string;
    delayMinutes: number;
    status: boolean;
}

export default function AdminAutomationPage() {
    const { showToast } = useToast();
    const [automations, setAutomations] = useState<Automation[]>([
        { id: 1, name: 'Welcome Message', channel: 'WhatsApp', trigger: 'New User Signup', messageTemplate: 'Hello {customer_name}, welcome to Cureza! 🌿 Here is an exclusive 10% discount coupon: WELCOME10. Use it at checkout to get started on your wellness journey.', delayMinutes: 5, status: true },
        { id: 2, name: 'Order Confirmation', channel: 'SMS', trigger: 'Order Placed', messageTemplate: 'Cureza: Order #{order_id} placed successfully! Total amount: {order_amount}. We will notify you once your supplements are dispatched. Health is Wealth!', delayMinutes: 0, status: true },
        { id: 3, name: 'Abandoned Cart Recovery', channel: 'WhatsApp', trigger: 'Cart Abandoned > 24h', messageTemplate: 'Hey {customer_name}, we noticed you left items in your Cureza cart! 🛒 Grab them now and get flat 5% off + free shipping. Click here to resume: {cart_url}', delayMinutes: 1440, status: true },
        { id: 4, name: 'Delivery Update', channel: 'SMS', trigger: 'Order Shipped', messageTemplate: 'Cureza Order #{order_id} has been shipped via {courier_partner}. Track your parcel here: {tracking_url}', delayMinutes: 0, status: true },
        { id: 5, name: 'Review Request', channel: 'WhatsApp', trigger: 'Order Delivered + 3 Days', messageTemplate: 'Hi {customer_name}, how are you loving your {product_name}? ⭐ Tap here to write a review and earn 100 Cureza coins: {review_url}', delayMinutes: 4320, status: false },
    ]);

    const [isCreating, setIsCreating] = useState(false);
    const [editingRule, setEditingRule] = useState<Automation | null>(null);

    // Form rule parameters
    const [formData, setFormData] = useState({
        name: '',
        channel: 'WhatsApp' as 'WhatsApp' | 'SMS',
        trigger: 'New User Signup',
        messageTemplate: '',
        delayMinutes: 0,
        status: true
    });

    const triggerOptions = [
        'New User Signup',
        'Order Placed',
        'Cart Abandoned > 24h',
        'Order Shipped',
        'Order Delivered + 3 Days',
        'Doctor Prescription Uploaded'
    ];

    const handleToggleStatus = (id: number) => {
        setAutomations(prev => prev.map(item => {
            if (item.id === id) {
                const nextStatus = !item.status;
                showToast(`"${item.name}" automation is now ${nextStatus ? 'Active' : 'Inactive'}`, 'success');
                return { ...item, status: nextStatus };
            }
            return item;
        }));
    };

    const handleAddOrUpdateRule = () => {
        if (!formData.name || !formData.messageTemplate) {
            return showToast("Please fill all required fields", "error");
        }

        if (editingRule) {
            // Update
            setAutomations(prev => prev.map(item => {
                if (item.id === editingRule.id) {
                    return {
                        ...item,
                        name: formData.name,
                        channel: formData.channel,
                        trigger: formData.trigger,
                        messageTemplate: formData.messageTemplate,
                        delayMinutes: formData.delayMinutes,
                        status: formData.status
                    };
                }
                return item;
            }));
            showToast("Automation updated successfully!", "success");
        } else {
            // Create
            const newRule: Automation = {
                id: Date.now(),
                name: formData.name,
                channel: formData.channel,
                trigger: formData.trigger,
                messageTemplate: formData.messageTemplate,
                delayMinutes: formData.delayMinutes,
                status: formData.status
            };
            setAutomations([...automations, newRule]);
            showToast("New automation rule added successfully!", "success");
        }

        closeModal();
    };

    const handleEditRule = (rule: Automation) => {
        setEditingRule(rule);
        setFormData({
            name: rule.name,
            channel: rule.channel,
            trigger: rule.trigger,
            messageTemplate: rule.messageTemplate,
            delayMinutes: rule.delayMinutes,
            status: rule.status
        });
        setIsCreating(true);
    };

    const handleDeleteRule = (id: number) => {
        if (!confirm('Are you sure you want to delete this automation flow?')) return;
        setAutomations(automations.filter(item => item.id !== id));
        showToast("Automation rule removed", "success");
    };

    const handleTriggerTest = (rule: Automation) => {
        showToast(`Simulating "${rule.name}" test packet to sandbox user...`, 'success');
    };

    const closeModal = () => {
        setIsCreating(false);
        setEditingRule(null);
        setFormData({
            name: '',
            channel: 'WhatsApp',
            trigger: 'New User Signup',
            messageTemplate: '',
            delayMinutes: 0,
            status: true
        });
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-350">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">SMS & WhatsApp Automation</h1>
                    <p className="text-gray-500 mt-1">Configure real-time automated notifications triggered by user events</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-cureza-green text-white px-5 py-2.5 rounded-xl hover:bg-green-700 font-bold shadow-sm transition-all"
                >
                    <Plus size={18} />
                    <span>Create Flow</span>
                </button>
            </div>

            {/* Alert Banner / Guide */}
            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4 text-sm text-blue-700">
                <Info size={20} className="shrink-0 text-blue-500 mt-0.5" />
                <div className="space-y-1">
                    <h4 className="font-extrabold text-blue-900">Variables Mapping Guide</h4>
                    <p className="text-blue-700/80 leading-relaxed">
                        Customize your templates by referencing system variables. Wrap them in curly braces to inject real values:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {['{customer_name}', '{order_id}', '{order_amount}', '{cart_url}', '{tracking_url}', '{product_name}'].map(v => (
                            <code key={v} className="bg-blue-100/70 border border-blue-200/50 text-blue-800 px-2 py-0.5 rounded-lg text-xs font-bold font-mono">{v}</code>
                        ))}
                    </div>
                </div>
            </div>

            {/* List of Automations */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                {automations.map((item) => (
                    <div 
                        key={item.id} 
                        className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-gray-50/30 transition-all group"
                    >
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3.5 rounded-2xl shrink-0 ${
                                item.channel === 'WhatsApp' 
                                    ? 'bg-green-50 text-green-600 border border-green-100' 
                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                                {item.channel === 'WhatsApp' ? <MessageSquare size={24} /> : <Smartphone size={24} />}
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-cureza-green transition-colors">{item.name}</h3>
                                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                        item.channel === 'WhatsApp' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                        {item.channel}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                    <Zap size={13} className="text-yellow-500 fill-yellow-500" />
                                    Trigger: <span className="text-gray-600">{item.trigger}</span>
                                    {item.delayMinutes > 0 && (
                                        <span className="text-gray-400 font-semibold ml-2">• Send delay: {item.delayMinutes >= 1440 ? `${item.delayMinutes / 1440} day(s)` : `${item.delayMinutes} mins`}</span>
                                    )}
                                </p>
                                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100/50 text-sm text-gray-600 font-medium max-w-3xl leading-relaxed mt-2 italic">
                                    "{item.messageTemplate}"
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleTriggerTest(item)}
                                    className="p-2 hover:bg-gray-150 bg-gray-50 text-gray-600 hover:text-cureza-green rounded-xl transition-all border border-gray-100 flex items-center gap-1.5 text-xs font-bold"
                                    title="Send simulation packet to testing mobile"
                                >
                                    <Play size={13} className="fill-current" /> Test Flow
                                </button>
                                <button 
                                    onClick={() => handleEditRule(item)}
                                    className="p-2 hover:bg-gray-150 bg-gray-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all border border-gray-100"
                                    title="Edit Template Message"
                                >
                                    <Edit2 size={13} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteRule(item.id)}
                                    className="p-2 hover:bg-red-50 bg-gray-50 text-gray-400 hover:text-red-650 rounded-xl transition-all border border-gray-100 hover:border-red-100"
                                    title="Remove Rule"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-extrabold uppercase ${item.status ? 'text-green-600' : 'text-gray-400'}`}>
                                    {item.status ? 'Active' : 'Inactive'}
                                </span>
                                <button 
                                    onClick={() => handleToggleStatus(item.id)}
                                    className={`transition-colors duration-200 focus:outline-none ${item.status ? 'text-cureza-green' : 'text-gray-300'}`}
                                >
                                    {item.status ? <ToggleRight size={44} className="stroke-[1.5]" /> : <ToggleLeft size={44} className="stroke-[1.5]" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-7 w-full max-w-xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h2 className="text-xl font-extrabold text-gray-900">
                                {editingRule ? 'Edit Automation Template' : 'Configure Custom Flow'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Flow Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green font-semibold"
                                    placeholder="e.g. Prescription Verification Confirmation"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Dispatch Channel</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-sm focus:ring-2"
                                        value={formData.channel}
                                        onChange={e => setFormData({ ...formData, channel: e.target.value as any })}
                                    >
                                        <option value="WhatsApp">WhatsApp Message</option>
                                        <option value="SMS">SMS Text</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Trigger Event</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-sm focus:ring-2"
                                        value={formData.trigger}
                                        onChange={e => setFormData({ ...formData, trigger: e.target.value })}
                                    >
                                        {triggerOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Delay (in Minutes)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-sm focus:ring-2"
                                    value={formData.delayMinutes}
                                    onChange={e => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                                    placeholder="0 for instant dispatch"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">E.g. Set to 1440 for 24 hours recovery delays.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Message Body Template</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-sm focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green font-medium"
                                    placeholder="Hello {customer_name}, your order #{order_id} has been verified..."
                                    value={formData.messageTemplate}
                                    onChange={e => setFormData({ ...formData, messageTemplate: e.target.value })}
                                />
                                <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                                    <span>Variables: {`{customer_name}, {order_id}, {product_name}`}</span>
                                    <span>Char count: {formData.messageTemplate.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2.5 text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddOrUpdateRule}
                                className="px-5 py-2.5 bg-cureza-green text-white rounded-xl hover:bg-green-700 text-sm font-bold shadow-sm"
                            >
                                {editingRule ? 'Update Flow' : 'Create Flow'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
