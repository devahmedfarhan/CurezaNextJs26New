'use client';

import { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, FileText, Plus, Clock, User, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ConsultationDetailsPage() {
    const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'history'>('chat');
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
            {/* Left Side - Video/Main Area */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Video Area */}
                <div className="bg-gray-900 rounded-lg overflow-hidden relative flex-1 min-h-[400px]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                👤
                            </div>
                            <h2 className="text-white text-xl font-bold">Rahul Sharma</h2>
                            <p className="text-gray-400">Connecting...</p>
                        </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                        <button 
                            onClick={() => setIsMicOn(!isMicOn)}
                            className={`p-4 rounded-full ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition`}
                        >
                            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                        <button 
                            onClick={() => setIsVideoOn(!isVideoOn)}
                            className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition`}
                        >
                            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                        </button>
                        <Link href="/doctor/dashboard/consultations">
                            <button className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition">
                                <PhoneOff size={24} />
                            </button>
                        </Link>
                    </div>

                    {/* Timer */}
                    <div className="absolute top-6 right-6 bg-black/50 px-3 py-1 rounded-full text-white text-sm font-mono flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        12:45
                    </div>
                </div>

                {/* Patient Quick Info */}
                <div className="bg-white p-3 rounded-lg border border-black/[0.05] flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">👤</div>
                        <div>
                            <h3 className="font-bold text-charcoal">Rahul Sharma</h3>
                            <p className="text-sm text-gray-500">32 Male • +91 98765 43210</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/doctor/dashboard/prescriptions/create">
                            <button className="flex items-center gap-2 px-4 py-2 bg-cureza-green text-white font-bold rounded-lg hover:bg-green-700 transition">
                                <FileText size={18} />
                                Prescribe
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Tabs */}
            <div className="w-full md:w-96 bg-white rounded-lg border border-black/[0.05] flex flex-col overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-cureza-green border-b-2 border-cureza-green' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Chat
                    </button>
                    <button 
                        onClick={() => setActiveTab('notes')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'notes' ? 'text-cureza-green border-b-2 border-cureza-green' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Clinical Notes
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'history' ? 'text-cureza-green border-b-2 border-cureza-green' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        History
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'chat' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="flex-1 space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-xs">👤</div>
                                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none text-sm text-gray-800">
                                        Hello Doctor, I have been having severe back pain for 3 days.
                                    </div>
                                </div>
                                <div className="flex gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-xs">Dr</div>
                                    <div className="bg-blue-50 p-3 rounded-lg rounded-tr-none text-sm text-gray-800">
                                        Hi Rahul. Does it radiate to your legs?
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cureza-green"
                                    />
                                    <button className="bg-cureza-green text-white p-2 rounded-lg hover:bg-green-700">
                                        <MessageSquare size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Chief Complaint</label>
                                <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm h-20" placeholder="Enter symptoms..."></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Diagnosis</label>
                                <textarea className="w-full border border-gray-300 rounded-lg p-2 text-sm h-20" placeholder="Enter diagnosis..."></textarea>
                            </div>
                            <button className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
                                Save Notes
                            </button>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <div className="border-l-2 border-gray-200 pl-4 pb-4">
                                <p className="text-xs text-gray-500 mb-1">10 Oct 2025</p>
                                <h4 className="font-bold text-sm text-charcoal">Viral Fever</h4>
                                <p className="text-xs text-gray-600">Prescribed Paracetamol, Rest.</p>
                            </div>
                            <div className="border-l-2 border-gray-200 pl-4 pb-4">
                                <p className="text-xs text-gray-500 mb-1">15 Aug 2025</p>
                                <h4 className="font-bold text-sm text-charcoal">Annual Checkup</h4>
                                <p className="text-xs text-gray-600">All vitals normal.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
