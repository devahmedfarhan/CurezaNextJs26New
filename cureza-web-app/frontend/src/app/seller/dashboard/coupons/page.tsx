'use client';

import { Plus, Tag, Trash2 } from 'lucide-react';

const COUPONS = [
    { code: 'WELCOME20', discount: '20%', type: 'Percentage', status: 'Active', usage: 150 },
    { code: 'FESTIVE500', discount: '₹500', type: 'Fixed Amount', status: 'Expired', usage: 45 },
    { code: 'FREESHIP', discount: 'Free Shipping', type: 'Shipping', status: 'Active', usage: 89 },
];

export default function SellerCouponsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Promotional Intelligence</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Deploy and monitor strategic marketing incentives.</p>
                </div>
            </div>

            <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="premium-table-header">
                                <th className="px-8 py-5">Strategic Code</th>
                                <th className="px-8 py-5">Benefit Vector</th>
                                <th className="px-8 py-5">Logic Category</th>
                                <th className="px-8 py-5">Activation Count</th>
                                <th className="px-8 py-5">Registry Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {COUPONS.map((coupon) => (
                                <tr key={coupon.code} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 text-cureza-green rounded-xl border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-all">
                                                <Tag size={16} />
                                            </div>
                                            <span className="font-extrabold text-gray-900 tracking-wider font-mono bg-gray-900 text-white px-3 py-1 rounded-lg text-xs">{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-gray-900">{coupon.discount}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{coupon.type}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-extrabold text-gray-700">{coupon.usage}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">activations</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${coupon.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            'bg-gray-100 text-gray-400 border border-gray-200'
                                            }`}>
                                            {coupon.status}
                                        </span>
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
