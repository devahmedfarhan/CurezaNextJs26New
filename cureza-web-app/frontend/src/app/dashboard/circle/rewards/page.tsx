'use client';

import { useState, useEffect } from 'react';
import { Gift, ShoppingBag, MapPin } from 'lucide-react';
import api from '@/lib/api';

export default function CircleRewardsPage() {
    const [rewards, setRewards] = useState<any[]>([]);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [userXP, setUserXP] = useState(0);
    const [userPoints, setUserPoints] = useState(0);
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
            setUserXP(commRes.data.xp || 0);
            setUserPoints(commRes.data.points || 0);
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards Shop</h1>
                    <p className="text-gray-500">Redeem your hard-earned points for exclusive perks</p>
                </div>
                <div className="flex flex-wrap gap-3 self-start">
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/30 px-5 py-2 rounded-lg font-bold shadow-sm text-sm">
                        Redeemable: {userPoints.toLocaleString()} Points
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 px-5 py-2 rounded-lg font-bold shadow-sm text-sm">
                        Lifetime: {userXP.toLocaleString()} XP
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('shop')}
                    className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                        activeTab === 'shop'
                            ? 'border-[#052326] text-[#052326] dark:text-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Available Rewards
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                        activeTab === 'history'
                            ? 'border-[#052326] text-[#052326] dark:text-white'
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
                        <div className="col-span-full bg-white dark:bg-gray-900 p-8 text-center border dark:border-gray-800 rounded-xl text-gray-500">
                            No rewards available in the shop right now. Check back later!
                        </div>
                    ) : (
                        rewards.map((reward) => {
                            const isAffordable = userPoints >= reward.points_cost;
                            const isOutOfStock = reward.stock === 0;

                            let color = 'bg-[#052326]';
                            if (reward.type === 'coupon') color = 'bg-emerald-650';
                            if (reward.type === 'physical') color = 'bg-blue-650';
                            if (reward.type === 'digital') color = 'bg-purple-650';

                            return (
                                <div key={reward.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                    <div className={`${color} h-32 flex items-center justify-center text-white relative`}>
                                        <Gift size={44} className="opacity-90" />
                                        <span className="absolute top-3 right-3 text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            {reward.type}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{reward.name}</h3>
                                        <p className="text-xs text-gray-500 mb-4 flex-1">{reward.description}</p>
                                        
                                        {reward.stock >= 0 && (
                                            <p className="text-[10px] text-gray-400 mb-3 font-semibold">
                                                {isOutOfStock ? 'OUT OF STOCK' : `STOCK: ${reward.stock} REMAINING`}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <span className="font-extrabold text-sm text-yellow-600 dark:text-yellow-400">{reward.points_cost.toLocaleString()} points</span>
                                            <button
                                                onClick={() => handleRedeemClick(reward)}
                                                disabled={!isAffordable || isOutOfStock}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                    isOutOfStock 
                                                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                        : isAffordable
                                                            ? 'bg-[#052326] text-white hover:bg-opacity-90 active:scale-[0.97]'
                                                            : 'bg-gray-100 dark:bg-gray-800/40 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200/50 dark:border-gray-800/50'
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
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    {redemptions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            You haven't redeemed any rewards yet. Redeem your points in the shop catalog!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {redemptions.map((item) => {
                                const date = new Date(item.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });

                                return (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-gray-105 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg shrink-0">
                                                <ShoppingBag size={22} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.reward?.name || 'Redeemed Item'}</h4>
                                                <p className="text-[10px] text-gray-500">Redeemed on {date}</p>
                                                
                                                {item.coupon_code && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Coupon Code:</span>
                                                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-bold text-[#052326] dark:text-emerald-400 border border-gray-250 dark:border-gray-700 select-all">
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
                                            <span className="block text-sm font-extrabold text-red-650">-{item.points_spent} pts</span>
                                            <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${
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
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Redemption</h3>
                            <button
                                onClick={() => setSelectedReward(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="bg-neutral-50 dark:bg-gray-800/40 p-4 rounded-xl border border-neutral-100 dark:border-gray-800 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 rounded-lg">
                                <Gift size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{selectedReward.name}</h4>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold">{selectedReward.points_cost.toLocaleString()} Points Cost</p>
                            </div>
                        </div>

                        <form onSubmit={handleRedeemSubmit} className="space-y-4">
                            {selectedReward.type === 'physical' && (
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Shipping Address</label>
                                    <textarea
                                        rows={3}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter full shipping address with pincode..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-750 rounded-lg text-xs bg-transparent text-gray-900 dark:text-white focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    ></textarea>
                                </div>
                            )}

                            <p className="text-xs text-gray-550">
                                Redeeming this reward will deduct {selectedReward.points_cost.toLocaleString()} Points from your available balance. Your lifetime XP and tier status will not be affected.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReward(null)}
                                    className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={redeeming}
                                    className="flex-1 bg-[#052326] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition-colors"
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
