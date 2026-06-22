'use client';

import { useState } from 'react';
import { Mail, Send, Users, BarChart2, Plus, X, Eye, CheckCircle2, Inbox, ArrowRight, HelpCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Campaign {
    id: number;
    title: string;
    subject: string;
    segment: string;
    template: string;
    sentAt: string;
    recipients: number;
    delivered: number;
    openRate: number;
}

export default function AdminEmailPage() {
    const { showToast } = useToast();
    const [campaigns, setCampaigns] = useState<Campaign[]>([
        { id: 1, title: 'November Wellness Newsletter', subject: 'Your guide to winter wellness ❄️', segment: 'All Customers', template: 'Weekly Newsletter', sentAt: 'Nov 24, 2025', recipients: 12500, delivered: 98, openRate: 24 },
        { id: 2, title: 'Supplements Flash Sale', subject: 'Flat 20% off on premium proteins!', segment: 'Inactive Users', template: 'Flash Sale Alert', sentAt: 'Dec 02, 2025', recipients: 4200, delivered: 99, openRate: 31 },
        { id: 3, title: 'Herbals Product Launch', subject: 'Introducing Cureza Organic Tea Blend 🌿', segment: 'Repeat Buyers', template: 'Product Launch', sentAt: 'Jan 15, 2026', recipients: 8400, delivered: 97, openRate: 28 },
    ]);

    const templates = [
        { id: 'launch', name: 'Product Launch', desc: 'Promote a new wellness product or collection with high visibility.', subject: 'Introducing our latest wellness solution! 🌟' },
        { id: 'weekly', name: 'Weekly Newsletter', desc: 'Share articles, expert tips, and top wellness discounts.', subject: 'Your weekly Cureza wellness digest 🍏' },
        { id: 'sale', name: 'Flash Sale Alert', desc: 'Urgent promotional codes, counters, and countdown headers.', subject: 'HURRY! 24-Hour Flash Sale Live! ⚡' }
    ];

    const segments = [
        { id: 'all', name: 'All Customers', count: 14820 },
        { id: 'repeat', name: 'Repeat Buyers', count: 5240 },
        { id: 'inactive', name: 'Inactive Users (>30 days)', count: 3180 },
        { id: 'newsletter', name: 'Newsletter Subscribers', count: 9600 }
    ];

    // Modal state
    const [isCreating, setIsCreating] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);
    const [sendingStage, setSendingStage] = useState('');

    // Form inputs
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        segment: 'all',
        template: 'weekly'
    });

    const getTemplateHTML = (templateName: string, subject: string) => {
        const primaryColor = '#16A34A'; // Cureza Green
        let content = '';

        if (templateName.includes('Launch')) {
            content = `
                <div style="background-color: #F8F3EF; padding: 30px; border-radius: 12px; font-family: sans-serif;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-weight: bold; color: ${primaryColor}; font-size: 24px;">CUREZA</span>
                    </div>
                    <div style="background-color: white; padding: 25px; border-radius: 12px; border: 0.35px solid rgba(0,0,0,0.5);">
                        <h2 style="color: #111827; margin-top: 0;">Introducing Our New Product Line! 🌿</h2>
                        <p style="color: #4B5563; line-height: 1.6;">We are excited to launch our new premium wellness collection designed specifically for your daily health routine.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="#" style="background-color: ${primaryColor}; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 8px;">Explore New Arrivals</a>
                        </div>
                        <p style="color: #9CA3AF; font-size: 12px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 15px; margin-bottom: 0;">You received this because you subscribed to Cureza updates.</p>
                    </div>
                </div>
            `;
        } else if (templateName.includes('Sale')) {
            content = `
                <div style="background-color: #111827; padding: 30px; border-radius: 12px; font-family: sans-serif; color: white;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-weight: bold; color: ${primaryColor}; font-size: 24px;">CUREZA</span>
                    </div>
                    <div style="background-color: #1F2937; padding: 25px; border-radius: 12px;">
                        <span style="background-color: #EF4444; color: white; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Limited Time Offer</span>
                        <h2 style="color: white; margin-top: 10px; font-size: 26px;">FLASH SALE IS LIVE! ⚡</h2>
                        <p style="color: #D1D5DB; line-height: 1.6; font-size: 15px;">Enjoy flat <b>20% off</b> storewide on all health and dietary supplements. Use code <b>FLASH20</b> at checkout.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="#" style="background-color: ${primaryColor}; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 8px;">Shop The Sale Now</a>
                        </div>
                        <p style="color: #9CA3AF; font-size: 11px; text-align: center; border-top: 1px solid #374151; padding-top: 15px;">Valid for 24 hours only. T&C Apply.</p>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div style="background-color: #F3F4F6; padding: 30px; border-radius: 12px; font-family: sans-serif;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-weight: bold; color: ${primaryColor}; font-size: 24px;">CUREZA</span>
                    </div>
                    <div style="background-color: white; padding: 25px; border-radius: 12px;">
                        <h2 style="color: #111827; margin-top: 0;">Your Weekly Health Insights 🍏</h2>
                        <p style="color: #4B5563; line-height: 1.6;">Stay updated with our curated wellness tips of the week, expert consultation advice, and exclusive store items recommendations.</p>
                        <ul style="color: #4B5563; line-height: 1.6; padding-left: 20px;">
                            <li>5 Ways to build immune response naturally</li>
                            <li>Understanding active herbal ingredients</li>
                            <li>Exclusive discount coupon inside!</li>
                        </ul>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="#" style="background-color: ${primaryColor}; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 8px;">Read Newsletter</a>
                        </div>
                    </div>
                </div>
            `;
        }

        return content;
    };

    const handleCreateCampaign = () => {
        setIsCreating(true);
        // Pre-fill subject based on first template
        const matched = templates.find(t => t.id === 'weekly');
        setFormData({
            title: '',
            subject: matched?.subject || '',
            segment: 'all',
            template: 'weekly'
        });
    };

    const handleTemplateChange = (tempId: string) => {
        const matched = templates.find(t => t.id === tempId);
        setFormData(prev => ({
            ...prev,
            template: tempId,
            subject: matched?.subject || prev.subject
        }));
    };

    const handleSendSimulate = () => {
        if (!formData.title || !formData.subject) {
            return showToast("Please fill all fields", "error");
        }

        setIsSending(true);
        setSendProgress(0);
        setSendingStage('Segmenting list and identifying recipients...');

        // Start progress ticker
        const interval = setInterval(() => {
            setSendProgress(prev => {
                const next = prev + 10;
                if (next === 30) setSendingStage('Rendering email layout and tags...');
                if (next === 60) setSendingStage('Dispatching messages through SMTP relays...');
                if (next === 90) setSendingStage('Awaiting delivery receipt signals...');
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        const targetSegment = segments.find(s => s.id === formData.segment);
                        const templateDetails = templates.find(t => t.id === formData.template);
                        
                        const newCampaign: Campaign = {
                            id: Date.now(),
                            title: formData.title,
                            subject: formData.subject,
                            segment: targetSegment?.name || 'All Customers',
                            template: templateDetails?.name || 'Custom Template',
                            sentAt: 'Just Now',
                            recipients: targetSegment?.count || 12500,
                            delivered: 100,
                            openRate: 0
                        };

                        setCampaigns([newCampaign, ...campaigns]);
                        showToast("Campaign Sent Successfully (Simulated)!", "success");
                        setIsSending(false);
                        setIsCreating(false);
                    }, 500);
                    return 100;
                }
                return next;
            });
        }, 150);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[10px] border-[0.35px] border-black/50">
                <div className="space-y-1.5">
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Email Campaign Builder</h1>
                    <p className="text-xs text-gray-500 font-normal">Design, segment, and dispatch promotional newsletters</p>
                </div>
                <button 
                    onClick={handleCreateCampaign}
                    className="bg-black text-white px-4 py-2.5 rounded-[10px] flex items-center gap-2 hover:bg-neutral-900 transition-colors font-medium text-xs"
                >
                    <Plus size={14} />
                    New Campaign
                </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border-[0.35px] border-black/50 p-5 rounded-[10px] space-y-2">
                    <span className="text-[10px] text-gray-550 font-medium tracking-normal block">Sent Newsletters</span>
                    <h3 className="text-2xl font-semibold text-gray-900">25,100</h3>
                    <p className="text-xs text-gray-400 font-normal">Total delivered email units this month</p>
                </div>
                <div className="bg-white border-[0.35px] border-black/50 p-5 rounded-[10px] space-y-2">
                    <span className="text-[10px] text-gray-550 font-medium tracking-normal block">Avg. Open Rate</span>
                    <h3 className="text-2xl font-semibold text-gray-900">27.6%</h3>
                    <p className="text-xs text-gray-400 font-normal">Benchmark average is 21.3%</p>
                </div>
                <div className="bg-white border-[0.35px] border-black/50 p-5 rounded-[10px] space-y-2">
                    <span className="text-[10px] text-gray-550 font-medium tracking-normal block">Delivery Success</span>
                    <h3 className="text-2xl font-semibold text-emerald-700">98.0%</h3>
                    <p className="text-xs text-gray-400 font-normal">SMTP Server bounce rate is 2.0%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Campaigns list */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-sm text-gray-900">Sent Campaigns Log</h3>
                    <div className="bg-white rounded-[10px] border-[0.35px] border-black/50 divide-y-[0.35px] divide-neutral-950/10 overflow-hidden">
                        {campaigns.map((c) => (
                            <div key={c.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-neutral-50 text-black border-[0.35px] border-black/50 rounded-[10px] mt-0.5">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">{c.title}</h4>
                                        <p className="text-xs text-gray-400 mt-0.5 font-normal">Subject: "{c.subject}"</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="text-[9px] font-medium bg-neutral-50 border-[0.35px] border-black/50 text-neutral-800 px-2 py-0.5 rounded-[10px]">{c.segment}</span>
                                            <span className="text-[9px] font-medium bg-neutral-100 text-gray-655 px-2 py-0.5 rounded-[10px]">{c.template}</span>
                                            <span className="text-xs text-gray-400 font-normal">• Sent {c.sentAt} • {c.recipients.toLocaleString()} Recipients</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t-[0.5px] sm:border-t-0 border-black/50">
                                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-[10px] border-[0.35px] border-black/50">
                                        {c.delivered}% Delivered
                                    </span>
                                    {c.openRate > 0 ? (
                                        <span className="text-xs font-medium text-gray-700 bg-gray-50 px-2.5 py-0.5 rounded-[10px] border-[0.35px] border-black/50 sm:mt-1.5">
                                            {c.openRate}% Open Rate
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400 sm:mt-1.5 italic font-normal">Gathering metrics...</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsletter design template presets */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-gray-900">Email Presets</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {templates.map((t) => (
                            <div 
                                key={t.id} 
                                className="bg-white p-5 rounded-[10px] border-[0.35px] border-black/50 hover:border-neutral-950 cursor-pointer transition-all duration-300 relative group"
                                onClick={() => setPreviewTemplate(t.name)}
                            >
                                <div className="absolute top-4 right-4 p-1 bg-neutral-50 text-gray-400 group-hover:text-black rounded-lg hover:bg-neutral-100 transition-colors border-[0.35px] border-transparent hover:border-neutral-950/10">
                                    <Eye size={14} />
                                </div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-black transition-colors text-sm">{t.name}</h4>
                                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-normal">{t.desc}</p>
                                <div className="mt-4 flex items-center gap-1 text-xs text-black font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Preview Preset Template</span>
                                    <ArrowRight size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Campaign Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[10px] p-6 w-full max-w-4xl border-[0.35px] border-black/50 flex flex-col lg:flex-row gap-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        {/* Editor Form */}
                        <div className="flex-1 space-y-5">
                            <div className="flex justify-between items-center border-b-[0.35px] border-black/50 pb-3">
                                <h2 className="text-base font-semibold text-gray-900">Configure Campaign</h2>
                                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg lg:hidden">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold text-gray-500 tracking-normal">Campaign Title</label>
                                    <input
                                        type="text"
                                        className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black font-semibold outline-none"
                                        placeholder="e.g. Winter Clearance Promo"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-semibold text-gray-500 tracking-normal">Email Subject Line</label>
                                    <input
                                        type="text"
                                        className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 text-xs focus:ring-1 focus:ring-black focus:border-black outline-none"
                                        placeholder="e.g. Get 20% off winter health essentials!"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-semibold text-gray-500 tracking-normal">Target Segment</label>
                                        <select
                                            className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-black focus:border-black outline-none"
                                            value={formData.segment}
                                            onChange={e => setFormData({ ...formData, segment: e.target.value })}
                                        >
                                            {segments.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.count.toLocaleString()} users)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-semibold text-gray-500 tracking-normal">Template Layout</label>
                                        <select
                                            className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 text-xs bg-white focus:ring-1 focus:ring-black focus:border-black outline-none"
                                            value={formData.template}
                                            onChange={e => handleTemplateChange(e.target.value)}
                                        >
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-5 border-t-[0.35px] border-black/50 mt-6">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    disabled={isSending}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 border-[0.35px] border-black/50 rounded-[10px] text-xs font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendSimulate}
                                    disabled={isSending}
                                    className="px-4 py-2 bg-black text-white rounded-[10px] hover:bg-neutral-900 text-xs font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSending ? (
                                        <>
                                            <span className="h-3 w-3 border-[0.5px] border-white border-t-transparent animate-spin rounded-full" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>Dispatch Campaign</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Interactive Preview Pane */}
                        <div className="w-full lg:w-96 border-t-[0.35px] lg:border-t-0 lg:border-l-[0.35px] border-black/50 pt-6 lg:pt-0 lg:pl-6 space-y-4">
                            <h4 className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                                <Eye size={14} className="text-gray-400" />
                                Live Newsletter Preview
                            </h4>
                            <div className="border-[0.35px] border-black/50 rounded-[10px] overflow-hidden p-1 bg-neutral-50 h-[380px] overflow-y-auto">
                                <div 
                                    className="bg-white rounded-lg p-3 min-h-full"
                                    dangerouslySetInnerHTML={{ 
                                        __html: getTemplateHTML(
                                            templates.find(t => t.id === formData.template)?.name || '', 
                                            formData.subject
                                        ) 
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Simulated progress overlay */}
            {isSending && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[10px] p-6 max-w-md w-full border-[0.35px] border-black/50 text-center space-y-6">
                        <div className="w-12 h-12 bg-neutral-50 border-[0.35px] border-black/50 text-black rounded-[10px] flex items-center justify-center mx-auto animate-bounce">
                            <Send size={20} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base text-gray-900">Dispatching Newsletter</h3>
                            <p className="text-xs text-gray-500 font-normal">{sendingStage}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-black h-full transition-all duration-300 rounded-full"
                                    style={{ width: `${sendProgress}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-gray-450 font-medium">{sendProgress}% complete</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Presets Preview Dialog */}
            {previewTemplate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[10px] p-6 w-full max-w-lg border-[0.35px] border-black/50 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b-[0.35px] border-black/50 pb-3">
                            <h3 className="font-semibold text-sm text-gray-900">Preset Layout: {previewTemplate}</h3>
                            <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="border-[0.35px] border-black/50 rounded-[10px] overflow-hidden bg-neutral-50 p-3 max-h-[450px] overflow-y-auto">
                            <div 
                                className="bg-white p-4 rounded-lg"
                                dangerouslySetInnerHTML={{ 
                                    __html: getTemplateHTML(previewTemplate, 'Preset Subject') 
                                }}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="px-4 py-2 bg-black text-white font-medium rounded-[10px] hover:bg-neutral-900 text-xs"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tutorial / Guidelines Section */}
            <div className="bg-neutral-50 border-[0.35px] border-black/50 rounded-[10px] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">How It Works & Guidelines | Email Campaigns Builder</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">1. Segment Targeting (List Segmentation)</h4>
                        <p>
                            Newsletter bhejne se pehle sahi target segment select karein. "All Customers" ke ilawa aap "Repeat Buyers" (jo bar-bar khareedte hain) aur "Inactive Users" (jinhone 30 din se order nahi kiya) ko target kar sakte hain.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">2. Layout Presets Preview</h4>
                        <p>
                            Right menu me preset templates hain jaise "Product Launch" aur "Flash Sale Alert". Kisi par bhi click karke live preview dekhein ke email customer ke inbox me kaisa dikhega.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">3. Simulated SMTP Dispatch</h4>
                        <p>
                            Jab aap "Dispatch Campaign" par click karte hain, toh system background process start karke recipient users ko emails queue aur send karta hai. Logs me conversion rates aur delivery reports real-time update hote hain.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
