'use client';

import { useState } from 'react';
import { MessageSquare, Smartphone, Zap, ToggleRight } from 'lucide-react';

export default function AdminAutomationPage() {
    const [automations, setAutomations] = useState([
        { id: 1, name: 'Welcome Message', channel: 'WhatsApp', trigger: 'New User Signup', status: true },
        { id: 2, name: 'Order Confirmation', channel: 'SMS', trigger: 'Order Placed', status: true },
        { id: 3, name: 'Abandoned Cart Recovery', channel: 'WhatsApp', trigger: 'Cart Abandoned > 24h', status: true },
        { id: 4, name: 'Delivery Update', channel: 'SMS', trigger: 'Order Shipped', status: true },
        { id: 5, name: 'Review Request', channel: 'WhatsApp', trigger: 'Order Delivered + 3 Days', status: false },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SMS / WhatsApp Automation</h1>
                    <p className="text-gray-500">Configure automated messages for user events</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {automations.map((item) => (
                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${item.channel === 'WhatsApp' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {item.channel === 'WhatsApp' ? <MessageSquare size={24} /> : <Smartphone size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Zap size={14} className="text-yellow-500" />
                                        Trigger: {item.trigger}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-sm font-medium ${item.status ? 'text-green-600' : 'text-gray-400'}`}>
                                    {item.status ? 'Active' : 'Inactive'}
                                </span>
                                <button className={`text-2xl ${item.status ? 'text-cureza-green' : 'text-gray-300'}`}>
                                    <ToggleRight size={40} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
