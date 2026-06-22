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
        const item = automations.find(a => a.id === id);
        if (!item) return;
        const nextStatus = !item.status;
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
        showToast(`"${item.name}" automation is now ${nextStatus ? 'Active' : 'Inactive'}`, 'success');
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
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[10px] border-[0.35px] border-black/50">
                <div className="space-y-1.5">
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">SMS & WhatsApp Automation</h1>
                    <p className="text-xs text-gray-500 font-normal">Configure real-time automated notifications triggered by user events</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-[10px] hover:bg-neutral-900 font-medium text-xs transition-all"
                >
                    <Plus size={14} />
                    <span>Create Flow</span>
                </button>
            </div>

            {/* Alert Banner / Guide */}
            <div className="bg-neutral-50 border-[0.35px] border-black/50 p-5 rounded-[10px] flex items-start gap-4 text-xs text-gray-700">
                <Info size={16} className="shrink-0 text-black mt-0.5" />
                <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900">Variables Mapping Guide</h4>
                    <p className="text-gray-500 leading-relaxed font-normal">
                        Customize your templates by referencing system variables. Wrap them in curly braces to inject real values:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {['{customer_name}', '{order_id}', '{order_amount}', '{cart_url}', '{tracking_url}', '{product_name}'].map(v => (
                            <code key={v} className="bg-neutral-100 border-[0.35px] border-black/50 text-neutral-850 px-2 py-0.5 rounded-[10px] text-xs font-normal font-mono">{v}</code>
                        ))}
                    </div>
                </div>
            </div>

            {/* List of Automations */}
            <div className="bg-white rounded-[10px] border-[0.35px] border-black/50 overflow-hidden divide-y-[0.35px] divide-neutral-950/10">
                {automations.map((item) => (
                    <div 
                        key={item.id} 
                        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-neutral-50/30 transition-all group"
                    >
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-neutral-50 border-[0.35px] border-black/50 text-black rounded-[10px] shrink-0">
                                {item.channel === 'WhatsApp' ? <MessageSquare size={20} /> : <Smartphone size={20} />}
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                                    <span className="bg-neutral-50 text-neutral-850 border-[0.35px] border-black/50 rounded-[10px] px-2 py-0.5 text-[9px] font-medium">
                                        {item.channel}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 font-normal flex items-center gap-1">
                                    <Zap size={11} className="text-neutral-500 fill-neutral-500" />
                                    Trigger: <span className="text-gray-600 font-medium">{item.trigger}</span>
                                    {item.delayMinutes > 0 && (
                                        <span className="text-gray-400 font-normal ml-2">• Send delay: {item.delayMinutes >= 1440 ? `${item.delayMinutes / 1440} day(s)` : `${item.delayMinutes} mins`}</span>
                                    )}
                                </p>
                                <div className="bg-neutral-50 p-3 rounded-[10px] border-[0.35px] border-black/50 text-xs text-neutral-600 font-normal max-w-3xl leading-relaxed mt-2 italic">
                                    "{item.messageTemplate}"
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto pt-4 md:pt-0 border-t-[0.35px] md:border-t-0 border-black/50">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleTriggerTest(item)}
                                    className="p-2 hover:bg-neutral-100 bg-neutral-50 text-neutral-850 border-[0.35px] border-black/50 rounded-[10px] flex items-center gap-1.5 text-xs font-medium"
                                    title="Send simulation packet to testing mobile"
                                >
                                    <Play size={11} className="fill-current" /> Test Flow
                                </button>
                                <button 
                                    onClick={() => handleEditRule(item)}
                                    className="p-2 hover:bg-neutral-100 bg-neutral-50 text-neutral-850 rounded-[10px] border-[0.35px] border-black/50"
                                    title="Edit Template Message"
                                >
                                    <Edit2 size={11} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteRule(item.id)}
                                    className="p-2 hover:bg-rose-50 bg-neutral-50 text-gray-450 hover:text-rose-650 rounded-[10px] border-[0.35px] border-black/50 hover:border-rose-100"
                                    title="Remove Rule"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-semibold ${item.status ? 'text-emerald-700' : 'text-neutral-400'}`}>
                                    {item.status ? 'Active' : 'Inactive'}
                                </span>
                                <button 
                                    onClick={() => handleToggleStatus(item.id)}
                                    className={`transition-colors duration-200 focus:outline-none ${item.status ? 'text-black' : 'text-gray-300'}`}
                                >
                                    {item.status ? <ToggleRight size={36} className="stroke-[1.5]" /> : <ToggleLeft size={36} className="stroke-[1.5]" />}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[10px] p-6 w-full max-w-xl border-[0.35px] border-black/50 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b-[0.35px] border-black/50 pb-3">
                            <h2 className="text-base font-semibold text-gray-900">
                                {editingRule ? 'Edit Automation Template' : 'Configure Custom Flow'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-normal mb-1">Flow Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3.5 py-2 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-black focus:border-black font-semibold outline-none"
                                    placeholder="e.g. Prescription Verification Confirmation"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 tracking-normal mb-1">Dispatch Channel</label>
                                    <select
                                        className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                                        value={formData.channel}
                                        onChange={e => setFormData({ ...formData, channel: e.target.value as any })}
                                    >
                                        <option value="WhatsApp">WhatsApp Message</option>
                                        <option value="SMS">SMS Text</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 tracking-normal mb-1">Trigger Event</label>
                                    <select
                                        className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
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
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-normal mb-1">Delay (in Minutes)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 bg-white text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                                    value={formData.delayMinutes}
                                    onChange={e => setFormData({ ...formData, delayMinutes: parseInt(e.target.value) || 0 })}
                                    placeholder="0 for instant dispatch"
                                />
                                <p className="text-[9px] text-gray-400 mt-1 font-normal">E.g. Set to 1440 for 24 hours recovery delays.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-normal mb-1">Message Body Template</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3.5 py-2.5 bg-white text-xs focus:ring-1 focus:ring-black focus:border-black font-medium outline-none"
                                    placeholder="Hello {customer_name}, your order #{order_id} has been verified..."
                                    value={formData.messageTemplate}
                                    onChange={e => setFormData({ ...formData, messageTemplate: e.target.value })}
                                />
                                <div className="mt-2 flex items-center justify-between text-[9px] text-gray-400 font-medium">
                                    <span>Variables: {`{customer_name}, {order_id}, {product_name}`}</span>
                                    <span>Char count: {formData.messageTemplate.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t-[0.35px] border-black/50 mt-6">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-50 border-[0.35px] border-black/50 rounded-[10px] text-xs font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddOrUpdateRule}
                                className="px-4 py-2 bg-black text-white rounded-[10px] hover:bg-neutral-900 text-xs font-medium"
                            >
                                {editingRule ? 'Update Flow' : 'Create Flow'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tutorial / Guidelines Section */}
            <div className="bg-neutral-50 border-[0.35px] border-black/50 rounded-[10px] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">How It Works & Guidelines | SMS & WhatsApp Automation</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">1. Trigger Events (Kab message send hoga)</h4>
                        <p>
                            Notification automatic tab trigger hoti hai jag koi specific event occur hota hai. Jaise customer signup karega tab, order confirm hone par, ya parcel dispatch hone par tracking URL trigger ho.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">2. Variables Mapping</h4>
                        <p>
                            Aap templates me placeholder bracket tags (jaise {"{customer_name}"}, {"{order_id}"}, {"{tracking_url}"}) dynamic value mapping ke liye inject kar sakte hain. System dispatch time par inko real user data se automatically replace kar dega.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">3. Delay Offsets & Channels</h4>
                        <p>
                            Aap delay timer set kar sakte hain (jaise cart abandonment notification 1440 minutes yaani 24 ghante ke baad send ho). Channel select karke WhatsApp gateway ya SMS service API routing set up karein aur testing user par click karke simulated packet inspect karein.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
