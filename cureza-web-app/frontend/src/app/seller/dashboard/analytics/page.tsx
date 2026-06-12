'use client';

import { BarChart2, TrendingUp, Users, ShoppingCart } from 'lucide-react';

export default function SellerAnalyticsPage() {
    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Intelligence & Insights</h1>
                    <p className="text-gray-500 mt-2 font-medium italic border-l-2 border-cureza-green pl-5 leading-relaxed">Granular analysis of marketplace performance and consumer interaction nodes.</p>
                </div>
                <div className="relative group w-full lg:w-auto">
                    <select className="w-full lg:w-auto bg-white border border-gray-100 rounded-2xl px-10 py-4 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md focus:outline-none focus:ring-8 focus:ring-green-500/5 focus:border-cureza-green transition-all cursor-pointer appearance-none">
                        <option>Current Session: 720h Audit</option>
                        <option>Quarterly Analysis Protocol</option>
                        <option>Annual Strategic Review</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-cureza-green transition-colors">
                        <TrendingUp size={16} />
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Market Revenue', value: '₹1,24,500', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', trend: '+12.5%', sub: 'vs last window' },
                    { label: 'Fulfillment Nodes', value: '156', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', trend: '+8.2%', sub: 'active pipeline' },
                    { label: 'Unique Clients', value: '120', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', trend: '+5.4%', sub: 'retention steady' },
                    { label: 'Conversion Yield', value: '3.2%', icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', trend: '-1.2%', sub: 'optimizing flow' },
                ].map((stat) => (
                    <div key={stat.label} className="premium-card p-8 group relative overflow-hidden bg-white">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150"></div>
                        <div className="relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-[1.25rem] ${stat.bg} ${stat.color} shadow-inner border group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-xl shadow-sm border ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tighter">{stat.value}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 opacity-60">{stat.label}</p>
                            <div className="h-1 w-12 bg-gray-100 rounded-full group-hover:bg-cureza-green group-hover:w-full transition-all duration-700"></div>
                            <p className="text-[9px] font-bold text-gray-300 mt-2 italic group-hover:text-gray-400 transition-colors uppercase tracking-tight">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="premium-card p-12 h-[32rem] flex flex-col bg-white border-b-4 border-b-gray-900 overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="font-black text-2xl text-gray-900 tracking-tighter">Strategic Sales Trajectory</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">Temporal Revenue Mapping</p>
                        </div>
                        <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 shadow-inner group-hover:bg-white transition-all"><span className="w-2.5 h-2.5 rounded-full bg-cureza-green shadow-sm shadow-emerald-500/50"></span> Active Cycle</span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 text-gray-300 opacity-50"><span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span> Previous Archetype</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 group-hover:border-cureza-green/20 transition-all duration-700 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <TrendingUp size={48} className="mb-4 opacity-10 group-hover:scale-125 group-hover:text-cureza-green transition-all" />
                        <p className="font-black italic tracking-widest text-[10px] uppercase opacity-40">Calculating Interactive Surface Matrix...</p>
                    </div>
                </div>
                <div className="premium-card p-12 h-[32rem] flex flex-col bg-white border-b-4 border-b-gray-900 overflow-hidden group">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="font-black text-2xl text-gray-900 tracking-tighter">Consumer Conversion Matrix</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">Traffic Origin & Behavior Distribution</p>
                        </div>
                        <button className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black hover:-translate-y-1 transition-all shadow-xl shadow-gray-200">Export Raw JSON</button>
                    </div>
                    <div className="flex-1 bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 group-hover:border-blue-500/20 transition-all duration-700 relative">
                        <Users size={48} className="mb-4 opacity-10 group-hover:scale-125 group-hover:text-blue-500 transition-all" />
                        <p className="font-black italic tracking-widest text-[10px] uppercase opacity-40">Awaiting External Traffic Stream Syncing...</p>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="premium-card overflow-hidden bg-white">
                <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                    <div>
                        <h3 className="font-black text-2xl text-gray-900 tracking-tighter">High-Velocity Catalog Nodes</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">Performance Leaderboard Ranking</p>
                    </div>
                    <button className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-500 hover:text-cureza-green hover:border-cureza-green transition-all shadow-sm hover:shadow-xl hover:shadow-green-100/50 uppercase tracking-widest">Full Performance Portfolio</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="premium-table-header">
                            <tr>
                                <th className="px-12 py-8">Product Descriptor</th>
                                <th className="px-12 py-8 text-center">Engagement (Views)</th>
                                <th className="px-12 py-8 text-center">Fulfillment Count</th>
                                <th className="px-12 py-8 text-right">Net Return Portfolio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="group hover:bg-gray-50/30 transition-all">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[1.25rem] bg-gray-100 border border-gray-50 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-gray-200 transition-all flex items-center justify-center font-black text-gray-300 text-sm">SKU</div>
                                            <div>
                                                <p className="font-black text-gray-900 text-base group-hover:text-cureza-green transition-colors tracking-tight">Cureza Organic Ashwagandha Pro Ext. v{i}.0</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 opacity-60">Performance Rank #{i}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-center">
                                        <p className="font-black text-gray-900 text-lg tracking-tighter">1,2{i}0</p>
                                        <div className="w-12 h-1 bg-emerald-100 rounded-full mx-auto mt-2 scale-x-50 group-hover:scale-x-100 transition-transform duration-700"></div>
                                    </td>
                                    <td className="px-12 py-10 text-center">
                                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 text-gray-900 font-black text-sm border border-gray-100 shadow-inner group-hover:bg-white group-hover:shadow-md transition-all">
                                            {50 - i * 5}
                                        </span>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        <p className="font-black text-gray-900 text-2xl tracking-tighter">₹{(15000 - i * 1000).toLocaleString()}</p>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 opacity-60">Success Injected</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
