'use client';

import { useState, useEffect } from 'react';
import { Code, Save, CheckCircle2, AlertTriangle, Play, RefreshCw, Terminal, Check, Info, HelpCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface EventLog {
    timestamp: string;
    event: string;
    platform: 'Meta' | 'GA4' | 'Both';
    payload: any;
}

export default function AdminPixelPage() {
    const { showToast } = useToast();
    const [metaPixelId, setMetaPixelId] = useState('123456789012345');
    const [ga4Id, setGa4Id] = useState('G-ABC123XYZ');
    const [isMetaConnected, setIsMetaConnected] = useState(true);
    const [isGa4Connected, setIsGa4Connected] = useState(true);

    const [isSaving, setIsSaving] = useState(false);
    const [logs, setLogs] = useState<EventLog[]>([
        { timestamp: '15:20:12', event: 'PageView', platform: 'Both', payload: { path: '/products/herbal-ashwagandha', title: 'Organic Ashwagandha Capsules' } },
        { timestamp: '15:21:45', event: 'AddToCart', platform: 'Meta', payload: { id: 18, title: 'Organic Ashwagandha Capsules', price: 650, quantity: 1 } },
        { timestamp: '15:22:02', event: 'InitiateCheckout', platform: 'Both', payload: { cart_total: 650, items_count: 1 } }
    ]);

    useEffect(() => {
        // Load settings from localStorage
        const storedMeta = localStorage.getItem('cureza_meta_pixel_id');
        const storedGa4 = localStorage.getItem('cureza_ga4_id');
        if (storedMeta) setMetaPixelId(storedMeta);
        if (storedGa4) setGa4Id(storedGa4);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem('cureza_meta_pixel_id', metaPixelId);
            localStorage.setItem('cureza_ga4_id', ga4Id);
            
            // Validate connection state
            setIsMetaConnected(metaPixelId.trim().length > 5);
            setIsGa4Connected(ga4Id.trim().startsWith('G-') && ga4Id.trim().length > 5);
            
            setIsSaving(false);
            showToast("Tracking configurations saved successfully!", "success");
            
            addLog('ConfigUpdated', 'Both', { meta_id: metaPixelId, ga4_id: ga4Id });
        }, 800);
    };

    const addLog = (eventName: string, platform: 'Meta' | 'GA4' | 'Both', payload: any) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newLog: EventLog = {
            timestamp: timeStr,
            event: eventName,
            platform,
            payload
        };
        setLogs(prev => [newLog, ...prev].slice(0, 15)); // Keep last 15 logs
    };

    const simulateEvent = (event: string) => {
        if (!isMetaConnected && !isGa4Connected) {
            return showToast("Please configure and connect at least one tracker first", "error");
        }

        let payload: any = {};
        const randomId = Math.floor(Math.random() * 100) + 1;

        switch (event) {
            case 'PageView':
                payload = { path: '/home', title: 'Cureza Wellness Store' };
                break;
            case 'AddToCart':
                payload = { id: randomId, title: 'Premium Multi-Vitamins Pack', price: 1450, currency: 'INR' };
                break;
            case 'InitiateCheckout':
                payload = { cart_total: 1450, coupon_applied: 'WELCOME10', currency: 'INR' };
                break;
            case 'Purchase':
                payload = { transaction_id: `TXN_${Date.now().toString().slice(-6)}`, value: 1305, tax: 45, shipping: 0 };
                break;
            default:
                payload = { custom_param: 'test_value' };
        }

        const platform = isMetaConnected && isGa4Connected ? 'Both' : isMetaConnected ? 'Meta' : 'GA4';
        addLog(event, platform, payload);
        showToast(`Simulated "${event}" event dispatched to connected trackers!`, 'success');
    };

    const clearLogs = () => {
        setLogs([]);
        showToast("Log stream cleared", "success");
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[10px] border-[0.35px] border-neutral-950/10">
                <div className="space-y-1.5">
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Meta Pixel & Google Tags</h1>
                    <p className="text-xs text-gray-500 font-normal">Manage pixel analytics integration, event parameters, and check connection logs</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-[10px] hover:bg-neutral-900 font-medium text-xs border-[0.35px] border-neutral-950/10 transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Saving Settings...</span>
                        </>
                    ) : (
                        <>
                            <Save size={14} />
                            <span>Save Settings</span>
                        </>
                    )}
                </button>
            </div>

            {/* Main Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Settings Configuration */}
                <div className="space-y-6">
                    <h3 className="font-semibold text-sm text-gray-900">Active Tags Setup</h3>

                    {/* Meta Pixel Card */}
                    <div className="bg-white p-5 rounded-[10px] border-[0.35px] border-neutral-950/10 space-y-4 hover:bg-neutral-50/10 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-neutral-50 border-[0.35px] border-neutral-950/10 text-black rounded-[10px]">
                                    <Code size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-semibold text-gray-900 text-sm">Meta Pixel (Facebook)</h4>
                                    <p className="text-[11px] text-gray-400 font-normal">Track purchase conversions and page views</p>
                                </div>
                            </div>
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-[10px] font-semibold ${
                                 isMetaConnected 
                                     ? 'bg-emerald-50 text-emerald-700 border-[0.35px] border-emerald-500/10' 
                                     : 'bg-neutral-50 text-neutral-500 border-[0.35px] border-neutral-950/10'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isMetaConnected ? 'bg-emerald-600' : 'bg-neutral-400'}`} />
                                {isMetaConnected ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-semibold text-gray-500 tracking-normal">Pixel ID</label>
                            <input
                                type="text"
                                className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3.5 py-2 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-black focus:border-black font-semibold outline-none"
                                placeholder="Enter Meta Pixel ID..."
                                value={metaPixelId}
                                onChange={e => setMetaPixelId(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Google Analytics GA4 Card */}
                    <div className="bg-white p-5 rounded-[10px] border-[0.35px] border-neutral-950/10 space-y-4 hover:bg-neutral-50/10 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-neutral-50 border-[0.35px] border-neutral-950/10 text-black rounded-[10px]">
                                    <Code size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-semibold text-gray-900 text-sm">Google Analytics 4 (GA4)</h4>
                                    <p className="text-[11px] text-gray-400 font-normal">Track user acquisition and behavior stats</p>
                                </div>
                            </div>
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-[10px] font-semibold ${
                                 isGa4Connected 
                                     ? 'bg-emerald-50 text-emerald-700 border-[0.35px] border-emerald-500/10' 
                                     : 'bg-neutral-50 text-neutral-500 border-[0.35px] border-neutral-950/10'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isGa4Connected ? 'bg-emerald-600' : 'bg-neutral-400'}`} />
                                {isGa4Connected ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-semibold text-gray-500 tracking-normal">Measurement ID (G-XXXXXXXXXX)</label>
                            <input
                                type="text"
                                className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3.5 py-2 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-black focus:border-black font-semibold outline-none"
                                placeholder="Enter GA4 Measurement ID..."
                                value={ga4Id}
                                onChange={e => setGa4Id(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Simulator Trigger Buttons */}
                    <div className="bg-white p-5 rounded-[10px] border-[0.35px] border-neutral-950/10 space-y-4">
                        <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                            <Play size={14} className="text-black" />
                            Simulation Trigger Console
                        </h4>
                        <p className="text-xs text-gray-400 font-normal">Click actions below to test how events transmit to active measurement channels:</p>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <button 
                                onClick={() => simulateEvent('PageView')} 
                                className="py-2 px-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-850 rounded-[10px] text-xs font-medium border-[0.35px] border-neutral-950/10 transition-colors flex items-center justify-center gap-1.5"
                            >
                                PageView
                            </button>
                            <button 
                                onClick={() => simulateEvent('AddToCart')} 
                                className="py-2 px-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-850 rounded-[10px] text-xs font-medium border-[0.35px] border-neutral-950/10 transition-colors flex items-center justify-center gap-1.5"
                            >
                                AddToCart
                            </button>
                            <button 
                                onClick={() => simulateEvent('InitiateCheckout')} 
                                className="py-2 px-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-850 rounded-[10px] text-xs font-medium border-[0.35px] border-neutral-950/10 transition-colors flex items-center justify-center gap-1.5"
                            >
                                InitiateCheckout
                            </button>
                            <button 
                                onClick={() => simulateEvent('Purchase')} 
                                className="py-2 px-3 bg-black text-white hover:bg-neutral-900 rounded-[10px] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border-[0.35px] border-neutral-950/10"
                            >
                                Purchase (Conversion)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Terminal Logging Console */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-black" />
                            Real-time Event Stream
                        </h3>
                        {logs.length > 0 && (
                            <button 
                                onClick={clearLogs}
                                className="text-xs font-medium text-neutral-500 hover:text-black hover:underline"
                            >
                                Clear console
                            </button>
                        )}
                    </div>

                    <div className="bg-neutral-900 text-neutral-100 font-mono rounded-[10px] p-5 flex-1 min-h-[460px] max-h-[560px] overflow-y-auto border-[0.35px] border-neutral-950/10 space-y-4">
                        <div className="text-[10px] text-neutral-450 tracking-normal border-b-[0.35px] border-neutral-850/50 pb-3 flex justify-between items-center">
                            <span>Connection Logs</span>
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" /> System Listening</span>
                        </div>
                        
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-neutral-500 text-xs">
                                <span>No events recorded. Trigger simulation packets above.</span>
                            </div>
                        ) : (
                            <div className="space-y-3.5 text-xs">
                                {logs.map((log, index) => (
                                    <div key={index} className="space-y-1.5 border-b-[0.35px] border-neutral-850/50 pb-3.5 last:border-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-neutral-450 font-semibold">[{log.timestamp}]</span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-emerald-450 font-bold">{log.event}</span>
                                                <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-[4px] border-[0.35px] border-neutral-850/50 font-sans">
                                                    to {log.platform}
                                                </span>
                                            </span>
                                        </div>
                                        <pre className="text-[11px] text-neutral-300 bg-neutral-950/40 p-2.5 rounded-[10px] border-[0.35px] border-neutral-950/10 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                            {JSON.stringify(log.payload, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tutorial / Guidelines Section */}
            <div className="bg-neutral-50 border-[0.35px] border-neutral-950/10 rounded-[10px] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">How It Works & Guidelines | Meta Pixel & GA4</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">1. Integration Setup (Pixel ID kese set karein)</h4>
                        <p>
                            Apna Meta Pixel ID ya GA4 Measurement ID inputs me fill karke "Save Settings" par click karein. Ye IDs website ke header injection scripts me push ho jayengi aur real-time event tracking active ho jayegi.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">2. Real-Time Tracking & Events</h4>
                        <p>
                            Cureza e-commerce storefront par user actions (PageView, AddToCart, InitiateCheckout, Purchase) directly connect ho kar conversion pixel ko standard event trigger push karte hain taaki ads targeting improve ho.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">3. Simulation Test Stream</h4>
                        <p>
                            Simulator Console buttons ka use karke aap dummy payloads test event trigger dispatch kar sakte hain. Dark panel container logs validation logs window me debug packet verify karne me help karta hai.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
