'use client';

import { useState, useEffect } from 'react';
import { Star, Video, Camera, Clock, CheckCircle2, EyeOff, AlertCircle, ArrowLeft, ExternalLink, Award, Gift, DollarSign, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Submission {
    id: number;
    platform: 'instagram' | 'youtube';
    link: string;
    content_type: 'photo' | 'video' | 'both';
    views_count: number;
    likes_count: number;
    status: 'pending' | 'approved' | 'rejected';
    points_awarded: number;
    xp_awarded: number;
    bonus_type: 'none' | 'points' | 'coupon' | 'cash' | 'free_product';
    bonus_details: string | null;
    created_at: string;
}

interface InfluencerMessage {
    id: number;
    subject: string;
    message: string;
    status: 'pending' | 'replied';
    reply_text: string | null;
    created_at: string;
    replied_at: string | null;
}

export default function InfluencerReviewsHub() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [messages, setMessages] = useState<InfluencerMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Tab State
    const [activeTab, setActiveTab] = useState<'submit' | 'contact'>('submit');

    // Submit Form state
    const [platform, setPlatform] = useState<'instagram' | 'youtube'>('instagram');
    const [contentType, setContentType] = useState<'photo' | 'video' | 'both'>('video');
    const [link, setLink] = useState('');

    // Contact Form state
    const [subject, setSubject] = useState('');
    const [contactBody, setContactBody] = useState('');
    const [sendingContact, setSendingContact] = useState(false);
    const [contactMessage, setContactMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/customer/social-submissions');
            setSubmissions(res.data?.data || []);
        } catch (err) {
            console.error("Error loading submissions:", err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get('/customer/influencer-messages');
            setMessages(res.data?.data || []);
        } catch (err) {
            console.error("Error loading messages:", err);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchSubmissions(), fetchMessages()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            await api.post('/customer/social-submissions', {
                platform,
                content_type: contentType,
                link
            });
            setMessage({ text: 'Review link submitted successfully for verification!', type: 'success' });
            setLink('');
            fetchSubmissions();
        } catch (err: any) {
            setMessage({
                text: err.response?.data?.message || 'Failed to submit link. Please check the URL.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingContact(true);
        setContactMessage(null);

        try {
            await api.post('/customer/influencer-messages', {
                subject,
                message: contactBody
            });
            setContactMessage({ text: 'Your message has been sent successfully!', type: 'success' });
            setSubject('');
            setContactBody('');
            fetchMessages();
        } catch (err: any) {
            setContactMessage({
                text: err.response?.data?.message || 'Failed to send message. Please try again.',
                type: 'error'
            });
        } finally {
            setSendingContact(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/circle" className="p-2 border border-black/10 rounded-lg hover:bg-neutral-50 transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Influencer Reviews Hub</h1>
                    <p className="text-gray-500 text-xs mt-0.5">Share your Cureza review posts on Instagram & YouTube to earn points, cash prizes, and free products</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Guidelines & Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Guidelines Card */}
                    <div 
                        className="bg-white dark:bg-gray-900 p-6 space-y-4"
                        style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                    >
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">How to Earn Rewards</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/10 rounded-[6px] border border-purple-100 dark:border-purple-900/30">
                                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest block mb-1">Instagram Review</span>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">+500 XP & +250 Points</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Post an Reels/Post reviewing Cureza products.</p>
                            </div>
                            <div className="p-4 bg-red-50/30 dark:bg-red-950/10 rounded-[6px] border border-red-100 dark:border-red-900/30">
                                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest block mb-1">YouTube Review</span>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">+1,000 XP & +500 Points</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Post a video review of Cureza products.</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs text-gray-650 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex gap-2">
                                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Purity Proof</strong>: The review video/photo post must explicitly mention/display the name <strong>"Cureza Wellness Hub"</strong>.</span>
                            </div>
                            <div className="flex gap-2">
                                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>1-Week Active Post</strong>: The review post must remain active on your social profile for <strong>at least 1 week</strong>. Deleting it early will forfeit points.</span>
                            </div>
                            <div className="flex gap-2">
                                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <span><strong>Viral Engagement Bonus</strong>: If your review gets high engagement (views/likes), you qualify for Tiers: **Extra Points, Gift Vouchers, Cash rewards, or Choice of any product for free!**</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-250">
                        <button
                            onClick={() => setActiveTab('submit')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                                activeTab === 'submit' 
                                    ? 'border-black text-black font-extrabold' 
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Submit Social Review
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                                activeTab === 'contact' 
                                    ? 'border-black text-black font-extrabold' 
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            Contact Cureza Team
                        </button>
                    </div>

                    {/* Submit Review Tab Content */}
                    {activeTab === 'submit' && (
                        <div 
                            className="bg-white dark:bg-gray-900 p-6 space-y-4"
                            style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                        >
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Submit Review Link</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Social Platform</label>
                                        <select 
                                            value={platform} 
                                            onChange={(e) => setPlatform(e.target.value as any)}
                                            className="w-full px-3 py-2 border border-black/10 rounded-lg text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10"
                                        >
                                            <option value="instagram">Instagram Reel / Post</option>
                                            <option value="youtube">YouTube Video</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Content Format</label>
                                        <select 
                                            value={contentType} 
                                            onChange={(e) => setContentType(e.target.value as any)}
                                            className="w-full px-3 py-2 border border-black/10 rounded-lg text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10"
                                        >
                                            <option value="video">Video Review</option>
                                            <option value="photo">Photo / Post Review</option>
                                            <option value="both">Both Photo & Video</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Public Review Link (URL)</label>
                                    <input 
                                        type="url" 
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="https://www.instagram.com/p/... or https://youtu.be/..."
                                        className="w-full px-3 py-2 border border-black/10 rounded-lg text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10"
                                        required
                                    />
                                </div>

                                {message && (
                                    <div className={`p-3 rounded-lg text-xs font-medium border ${
                                        message.type === 'success' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                        {message.text}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="bg-[#052326] text-white hover:bg-opacity-95 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Link'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Contact Cureza Team Tab Content */}
                    {activeTab === 'contact' && (
                        <div 
                            className="bg-white dark:bg-gray-900 p-6 space-y-4"
                            style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                        >
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Contact Cureza Circle Team</h2>
                            <p className="text-xs text-gray-500">Ask us questions about campaign guidelines, custom sponsor deals, product testing samples, or payment rewards details.</p>
                            
                            <form onSubmit={handleSendMessage} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Subject / Inquiry Title</label>
                                    <input 
                                        type="text" 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g., Requesting custom collaboration / Free product sample request"
                                        className="w-full px-3 py-2 border border-black/10 rounded-lg text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Message</label>
                                    <textarea 
                                        value={contactBody}
                                        onChange={(e) => setContactBody(e.target.value)}
                                        placeholder="Write your message here..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-black/10 rounded-lg text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 resize-none"
                                        required
                                    ></textarea>
                                </div>

                                {contactMessage && (
                                    <div className={`p-3 rounded-lg text-xs font-medium border ${
                                        contactMessage.type === 'success' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                        {contactMessage.text}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={sendingContact}
                                    className="bg-[#052326] text-white hover:bg-opacity-95 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Send size={12} />
                                    {sendingContact ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    )}

                </div>

                {/* Right Side: History Logs (Submissions or Contact Messages) */}
                <div className="space-y-6">
                    {activeTab === 'submit' ? (
                        <div 
                            className="bg-white dark:bg-gray-900 p-6 space-y-4"
                            style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                        >
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Submission Logs</h2>

                            {loading ? (
                                <div className="text-center py-6 text-xs text-gray-400 animate-pulse">Loading logs...</div>
                            ) : submissions.length === 0 ? (
                                <div className="text-center py-6 text-xs text-gray-400 font-medium">No reviews submitted yet.</div>
                            ) : (
                                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                                    {submissions.map((sub) => {
                                        let badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-150';
                                        let badgeText = 'Pending';
                                        if (sub.status === 'approved') {
                                            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                                            badgeText = 'Approved';
                                        } else if (sub.status === 'rejected') {
                                            badgeColor = 'bg-red-50 text-red-700 border-red-150';
                                            badgeText = 'Rejected';
                                        }

                                        return (
                                            <div key={sub.id} className="p-3 border border-black/5 rounded-lg space-y-2 bg-neutral-50/50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                                        {sub.platform} • {sub.content_type}
                                                    </span>
                                                    <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wider ${badgeColor}`}>
                                                        {badgeText}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs">
                                                    <a 
                                                        href={sub.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium truncate max-w-[150px]"
                                                    >
                                                        View Post <ExternalLink size={12} />
                                                    </a>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(sub.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {sub.status === 'approved' && (
                                                    <div className="pt-1.5 border-t border-black/5 text-[10px] space-y-1">
                                                        <div className="flex justify-between font-semibold text-emerald-700">
                                                            <span>Standard Reward:</span>
                                                            <span>+{sub.points_awarded} Points (+{sub.xp_awarded} XP)</span>
                                                        </div>

                                                        {sub.bonus_type !== 'none' && (
                                                            <div className="p-1.5 bg-yellow-50 border border-yellow-150 rounded flex items-start gap-1 text-[9px] text-yellow-800 mt-1 font-bold">
                                                                {sub.bonus_type === 'coupon' && <Gift size={12} className="shrink-0 mt-0.5" />}
                                                                {sub.bonus_type === 'points' && <Award size={12} className="shrink-0 mt-0.5" />}
                                                                {sub.bonus_type === 'cash' && <DollarSign size={12} className="shrink-0 mt-0.5" />}
                                                                {sub.bonus_type === 'free_product' && <Star size={12} className="shrink-0 mt-0.5" />}
                                                                <div>
                                                                    <span className="uppercase tracking-wider block">Viral Engagement Bonus!</span>
                                                                    <span className="font-semibold block mt-0.5">{sub.bonus_details}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div 
                            className="bg-white dark:bg-gray-900 p-6 space-y-4"
                            style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                        >
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Message Logs</h2>

                            {loading ? (
                                <div className="text-center py-6 text-xs text-gray-400 animate-pulse">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-6 text-xs text-gray-400 font-medium">No messages sent yet.</div>
                            ) : (
                                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                                    {messages.map((msg) => {
                                        let badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-150';
                                        let badgeText = 'Pending Reply';
                                        if (msg.status === 'replied') {
                                            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                                            badgeText = 'Replied';
                                        }

                                        return (
                                            <div key={msg.id} className="p-3 border border-black/5 rounded-lg space-y-2 bg-neutral-50/50 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-800 truncate max-w-[150px]">
                                                        {msg.subject}
                                                    </span>
                                                    <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wider ${badgeColor}`}>
                                                        {badgeText}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-gray-600 italic">
                                                    "{msg.message}"
                                                </p>

                                                <span className="block text-[10px] text-gray-400 text-right">
                                                    {new Date(msg.created_at).toLocaleDateString()}
                                                </span>

                                                {msg.status === 'replied' && msg.reply_text && (
                                                    <div className="pt-2 border-t border-black/5 space-y-1 bg-white p-2 rounded border border-black/5">
                                                        <span className="font-bold text-[10px] text-gray-700 flex items-center gap-1">
                                                            <MessageSquare size={12} /> Cureza Team:
                                                        </span>
                                                        <p className="text-gray-655 font-medium pl-4">{msg.reply_text}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
