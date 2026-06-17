'use client';

import { useState, useEffect } from 'react';
import { Gift, ShoppingBag, CreditCard, ChevronRight, MapPin, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function CircleRewardsPage() {
    const [rewards, setRewards] = useState<any[]>([]);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [userXP, setUserXP] = useState(0);
    const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [selectedReward, setSelectedReward] = useState<any>(null);
    const [shippingAddress, setShippingAddress] = useState('');
    const [redeeming, setRedeeming] = useState(false);

    const loadData = async () => {
        try {
            const [rewardsRes, redemptionsRes, commRes] = await Promise.all([
                api.get('/user/rewards'),
                api.get('/user/redemptions'),
                api.get('/user/community')
            ]);
            setRewards(rewardsRes.data || []);
            setRedemptions(redemptionsRes.data || []);
            setUserXP(commRes.data.points || 0);
        } catch (err) {
            console.error("Error loading rewards shop data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRedeemClick = (reward: any) => {
        setSelectedReward(reward);
        setShippingAddress('');
    };

    const handleRedeemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReward) return;

        if (selectedReward.type === 'physical' && !shippingAddress.trim()) {
            alert("Please enter a shipping address.");
            return;
        }

        setRedeeming(true);
        try {
            const res = await api.post(`/user/rewards/${selectedReward.id}/redeem`, {
                shipping_address: selectedReward.type === 'physical' ? shippingAddress : undefined
            });

            alert(res.data.message || "Reward redeemed successfully!");
            setSelectedReward(null);
            loadData(); // Reload points and history
        } catch (err: any) {
            console.error("Redemption error:", err);
            alert(err.response?.data?.message || "Failed to redeem reward.");
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rewards Shop</h1>
                    <p className="text-gray-500">Redeem your hard-earned XP for exclusive perks</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-6 py-2.5 rounded-lg font-bold shadow-sm self-start">
                    Balance: {userXP.toLocaleString()} XP
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('shop')}
                    className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                        activeTab === 'shop'
                            ? 'border-[#052326] text-[#052326]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Available Rewards
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                        activeTab === 'history'
                            ? 'border-[#052326] text-[#052326]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Redemption History
                </button>
            </div>

            {/* shop Catalog */}
            {activeTab === 'shop' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.length === 0 ? (
                        <div className="col-span-full bg-white p-8 text-center border rounded-xl text-gray-500">
                            No rewards available in the shop right now. Check back later!
                        </div>
                    ) : (
                        rewards.map((reward) => {
                            const isAffordable = userXP >= reward.points_cost;
                            const isOutOfStock = reward.stock === 0;

                            let color = 'bg-[#052326]';
                            if (reward.type === 'coupon') color = 'bg-emerald-600';
                            if (reward.type === 'physical') color = 'bg-blue-600';
                            if (reward.type === 'digital') color = 'bg-purple-600';

                            return (
                                <div key={reward.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                    <div className={`${color} h-32 flex items-center justify-center text-white relative`}>
                                        <Gift size={48} />
                                        <span className="absolute top-3 right-3 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                                            {reward.type}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{reward.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4 flex-1">{reward.description}</p>
                                        
                                        {reward.stock >= 0 && (
                                            <p className="text-xs text-gray-400 mb-3">
                                                {isOutOfStock ? 'Out of Stock' : `Stock: ${reward.stock} remaining`}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-bold text-yellow-600">{reward.points_cost.toLocaleString()} XP</span>
                                            <button
                                                onClick={() => handleRedeemClick(reward)}
                                                disabled={!isAffordable || isOutOfStock}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    isOutOfStock 
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : isAffordable
                                                            ? 'bg-[#052326] text-white hover:bg-opacity-90'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {isOutOfStock ? 'Sold Out' : 'Redeem'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Redemption History */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {redemptions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            You haven't redeemed any rewards yet. Redeem your points in the shop catalog!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {redemptions.map((item) => {
                                const date = new Date(item.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });

                                return (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg shrink-0">
                                                <ShoppingBag size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{item.reward?.name || 'Redeemed Item'}</h4>
                                                <p className="text-xs text-gray-500">Redeemed on {date}</p>
                                                
                                                {item.coupon_code && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[11px] text-gray-400 font-medium">Coupon Code:</span>
                                                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-900 border border-gray-200 select-all">
                                                            {item.coupon_code}
                                                        </code>
                                                    </div>
                                                )}

                                                {item.shipping_address && (
                                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                                                        <MapPin size={12} className="text-gray-400" />
                                                        Address: {item.shipping_address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="sm:text-right self-start sm:self-center">
                                            <span className="block text-sm font-bold text-yellow-600">-{item.points_spent} XP</span>
                                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                                                item.status === 'fulfilled' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : item.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Redemption Confirmation Modal */}
            {selectedReward && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-900">Confirm Redemption</h3>
                            <button
                                onClick={() => setSelectedReward(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg">
                                <Gift size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{selectedReward.name}</h4>
                                <p className="text-xs text-yellow-600 font-bold">{selectedReward.points_cost.toLocaleString()} XP Cost</p>
                            </div>
                        </div>

                        <form onSubmit={handleRedeemSubmit} className="space-y-4">
                            {selectedReward.type === 'physical' && (
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Shipping Address</label>
                                    <textarea
                                        rows={3}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter full shipping address with pincode..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    ></textarea>
                                </div>
                            )}

                            <p className="text-xs text-gray-500">
                                Redeeming this reward will immediately deduct {selectedReward.points_cost.toLocaleString()} XP from your available balance.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReward(null)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={redeeming}
                                    className="flex-1 bg-[#052326] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                                >
                                    {redeeming ? 'Redeeming...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
