'use client';

import { useState, useEffect } from 'react';
import { Code, Save, CheckCircle2, AlertTriangle, Play, RefreshCw, Terminal, Check, Info } from 'lucide-react';
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
        <div className="space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-350">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meta Pixel & Google Tags</h1>
                    <p className="text-gray-500 mt-1">Manage pixel analytics integration, event parameters, and check connection logs</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-cureza-green text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-green-700 font-bold transition shadow-sm disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <RefreshCw size={18} className="animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            <span>Save Settings</span>
                        </>
                    )}
                </button>
            </div>

            {/* Main Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Settings Configuration */}
                <div className="space-y-6">
                    <h3 className="font-extrabold text-xl text-gray-900">Active Tags Setup</h3>

                    {/* Meta Pixel Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                                    <Code size={24} />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-gray-900 text-lg">Meta Pixel (Facebook)</h4>
                                    <p className="text-xs text-gray-400">Track purchase conversions and page views</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                isMetaConnected 
                                    ? 'bg-green-50 text-green-700 border border-green-150' 
                                    : 'bg-yellow-50 text-yellow-750 border border-yellow-150'
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isMetaConnected ? 'bg-green-600' : 'bg-yellow-500'}`} />
                                {isMetaConnected ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Pixel ID</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green text-sm font-semibold"
                                placeholder="Enter Meta Pixel ID..."
                                value={metaPixelId}
                                onChange={e => setMetaPixelId(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Google Analytics GA4 Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
                                    <Code size={24} />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-gray-900 text-lg">Google Analytics 4 (GA4)</h4>
                                    <p className="text-xs text-gray-400">Track user acquisition and behavior stats</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                isGa4Connected 
                                    ? 'bg-green-50 text-green-700 border border-green-150' 
                                    : 'bg-yellow-50 text-yellow-750 border border-yellow-150'
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isGa4Connected ? 'bg-green-600' : 'bg-yellow-500'}`} />
                                {isGa4Connected ? 'Connected' : 'Offline'}
                            </span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Measurement ID (G-XXXXXXXXXX)</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green text-sm font-semibold"
                                placeholder="Enter GA4 Measurement ID..."
                                value={ga4Id}
                                onChange={e => setGa4Id(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Simulator Trigger Buttons */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
                            <Play size={16} className="text-cureza-green" />
                            Simulation Trigger Console
                        </h4>
                        <p className="text-xs text-gray-500">Click actions below to test how events transmit to active measurement channels:</p>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <button 
                                onClick={() => simulateEvent('PageView')} 
                                className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-colors flex items-center justify-center gap-1.5"
                            >
                                PageView
                            </button>
                            <button 
                                onClick={() => simulateEvent('AddToCart')} 
                                className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-colors flex items-center justify-center gap-1.5"
                            >
                                AddToCart
                            </button>
                            <button 
                                onClick={() => simulateEvent('InitiateCheckout')} 
                                className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-colors flex items-center justify-center gap-1.5"
                            >
                                InitiateCheckout
                            </button>
                            <button 
                                onClick={() => simulateEvent('Purchase')} 
                                className="py-2.5 px-4 bg-cureza-green/10 hover:bg-cureza-green/20 text-cureza-green rounded-xl text-xs font-bold border border-cureza-green/20 transition-colors flex items-center justify-center gap-1.5"
                            >
                                Purchase (Conversion)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Terminal Logging Console */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-gray-400" />
                            Real-time Event Stream
                        </h3>
                        {logs.length > 0 && (
                            <button 
                                onClick={clearLogs}
                                className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
                            >
                                Clear console
                            </button>
                        )}
                    </div>

                    <div className="bg-gray-950 text-gray-200 font-mono rounded-3xl p-6 shadow-2xl flex-1 min-h-[460px] max-h-[560px] overflow-y-auto border border-gray-800 space-y-4">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-3 flex justify-between items-center">
                            <span>Connection Logs</span>
                            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping" /> System Listening</span>
                        </div>
                        
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-gray-600 text-xs">
                                <span>No events recorded. Trigger simulation packets above.</span>
                            </div>
                        ) : (
                            <div className="space-y-3.5 text-xs">
                                {logs.map((log, index) => (
                                    <div key={index} className="space-y-1.5 border-b border-gray-900 pb-3.5 last:border-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-400 font-bold">[{log.timestamp}]</span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-green-400 font-extrabold">{log.event}</span>
                                                <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.2 rounded-md font-sans">
                                                    to {log.platform}
                                                </span>
                                            </span>
                                        </div>
                                        <pre className="text-[11px] text-gray-300 bg-gray-900/50 p-2.5 rounded-xl border border-gray-900 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                            {JSON.stringify(log.payload, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
