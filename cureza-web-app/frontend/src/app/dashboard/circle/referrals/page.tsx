'use client';

import { useState } from 'react';
import { Copy, Share2, Mail, MessageSquare } from 'lucide-react';

export default function CircleReferralPage() {
    const [copied, setCopied] = useState(false);
    const referralCode = 'FARHAN2025';
    const referralLink = `https://cureza.com/invite/${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Invite Friends & Earn Big!</h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    Share the wellness journey with your friends. They get <span className="font-bold text-green-600">₹500 OFF</span> their first order, and you get <span className="font-bold text-green-600">1000 XP</span> when they shop.
                </p>
            </div>

            {/* Referral Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 shadow-sm">
                <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-between max-w-md mx-auto shadow-sm">
                    <code className="text-gray-900 font-bold px-4 text-lg">{referralLink}</code>
                    <button
                        onClick={handleCopy}
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        {copied ? 'Copied!' : <><Copy size={18} /> Copy Link</>}
                    </button>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-[#25D366]">
                        <MessageSquare size={24} />
                    </button>
                    <button className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-blue-600">
                        <Share2 size={24} />
                    </button>
                    <button className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-red-500">
                        <Mail size={24} />
                    </button>
                </div>
            </div>

            {/* How it Works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
                <div>
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
                    <h3 className="font-bold text-gray-900 mb-2">Share Link</h3>
                    <p className="text-sm text-gray-500">Send your unique link to friends via WhatsApp or Email.</p>
                </div>
                <div>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
                    <h3 className="font-bold text-gray-900 mb-2">Friend Shops</h3>
                    <p className="text-sm text-gray-500">Your friend signs up and places their first order.</p>
                </div>
                <div>
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
                    <h3 className="font-bold text-gray-900 mb-2">You Earn</h3>
                    <p className="text-sm text-gray-500">Get 1000 XP instantly added to your wallet.</p>
                </div>
            </div>
        </div>
    );
}
