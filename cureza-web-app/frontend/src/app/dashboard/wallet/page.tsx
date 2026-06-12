'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import api from '@/lib/api';

interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    points: number;
    description: string;
    created_at: string;
}

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [points, setPoints] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/wallet')
            .then((res) => {
                setBalance(res.data.balance);
                setPoints(res.data.points);
                setTransactions(res.data.transactions);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading wallet...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">My Wallet & Rewards</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Balance */}
                <div className="bg-gradient-to-br from-cureza-green to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Wallet size={24} />
                        </div>
                        <h3 className="font-medium text-white/90">Wallet Balance</h3>
                    </div>
                    <div className="text-3xl font-bold">₹{balance.toFixed(2)}</div>
                    <p className="text-sm text-white/80 mt-2">Use this for your next purchase</p>
                </div>

                {/* Reward Points */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="font-medium text-white/90">Reward Points</h3>
                    </div>
                    <div className="text-3xl font-bold">{points} pts</div>
                    <p className="text-sm text-white/80 mt-2">Redeem for exclusive discounts</p>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <History size={20} className="text-gray-500" />
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions yet</div>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{tx.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}{tx.amount > 0 ? `₹${tx.amount}` : `${tx.points} pts`}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
