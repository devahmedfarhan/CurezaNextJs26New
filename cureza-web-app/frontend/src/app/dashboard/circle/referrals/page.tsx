'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2, Mail, MessageSquare } from 'lucide-react';
import api from '@/lib/api';

export default function CircleReferralPage() {
    const [copied, setCopied] = useState(false);
    const [referralsData, setReferralsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/referrals')
            .then((res) => {
                setReferralsData(res.data);
            })
            .catch((err) => console.error("Error loading referrals data:", err))
            .finally(() => setLoading(false));
    }, []);

    const referralCode = referralsData?.referral_code || 'GUEST';
    
    // In a real NextJS app, read from window.location.origin
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cureza.com';
    const referralLink = `${origin}/register?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    const referrals = referralsData?.referrals || [];
    const totalEarned = referralsData?.total_earned || 0;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Invite Friends & Earn Big!</h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    Share the wellness journey with your friends. They get a coupon reward on sign up, and you get <span className="font-bold text-[#052326]">bonus XP & redeemable Points</span> when they make their first purchase.
                </p>
            </div>

            {/* Referral Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 shadow-sm text-center">
                <div className="bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-between max-w-md mx-auto shadow-sm">
                    <code className="text-gray-900 font-bold px-4 text-sm md:text-base truncate">{referralLink}</code>
                    <button
                        onClick={handleCopy}
                        className="bg-[#052326] text-white px-4 md:px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shrink-0 text-xs md:text-sm"
                    >
                        {copied ? 'Copied!' : <><Copy size={16} /> Copy</>}
                    </button>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent("Join me on my wellness journey at Cureza and unlock exclusive rewards! Signup using my link: " + referralLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-[#25D366]"
                    >
                        <MessageSquare size={24} />
                    </a>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'Cureza Referral Program',
                                    text: 'Join me on Cureza and earn rewards!',
                                    url: referralLink,
                                });
                            }
                        }}
                        className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-blue-600"
                    >
                        <Share2 size={24} />
                    </button>
                    <a
                        href={`mailto:?subject=${encodeURIComponent("Invitation to join Cureza Wellness")}&body=${encodeURIComponent("Hello!\n\nI invite you to join Cureza for your health & wellness supplements. Signup using my link to get a special discount coupon: " + referralLink)}`}
                        className="p-4 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-red-500"
                    >
                        <Mail size={24} />
                    </a>
                </div>
            </div>

            {/* Referrals Log */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Your Referrals</h3>
                    <span className="bg-[#052326]/10 text-[#052326] text-xs font-bold px-3 py-1 rounded-full">
                        Total Earned: {totalEarned} Points
                    </span>
                </div>
                {referrals.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No friends referred yet. Share your code above to get started!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {referrals.map((item: any) => {
                            const date = new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });

                            return (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900">{item.referred_user ? item.referred_user.name : 'Registered Friend'}</p>
                                        <p className="text-xs text-gray-400">Joined: {date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                                            item.status === 'completed' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {item.status === 'completed' ? `+${item.reward_points} Points` : 'Pending Purchase'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* How it Works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100 text-center">
                <div>
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
                    <h3 className="font-bold text-gray-900 mb-2">Share Link</h3>
                    <p className="text-sm text-gray-500">Send your unique link to friends via WhatsApp, social media, or email.</p>
                </div>
                <div>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
                    <h3 className="font-bold text-gray-900 mb-2">Friend Shops</h3>
                    <p className="text-sm text-gray-500">Your friend registers via link and places their first order.</p>
                </div>
                <div>
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
                    <h3 className="font-bold text-gray-900 mb-2">You Earn</h3>
                    <p className="text-sm text-gray-500">Get bonus Points & XP credited to your wallet instantly upon their order completion.</p>
                </div>
            </div>
        </div>
    );
}
