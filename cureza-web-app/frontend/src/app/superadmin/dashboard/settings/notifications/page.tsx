'use client';

import { Mail, MessageSquare, Bell, Edit } from 'lucide-react';

export default function AdminNotificationSettingsPage() {
    const templates = [
        { id: 1, name: 'Welcome Email', type: 'Email', subject: 'Welcome to Cureza!', status: 'Active' },
        { id: 2, name: 'Order Confirmation', type: 'Email', subject: 'Order #{{order_id}} Confirmed', status: 'Active' },
        { id: 3, name: 'Order Shipped', type: 'SMS', subject: 'Your order is on the way!', status: 'Active' },
        { id: 4, name: 'Password Reset', type: 'Email', subject: 'Reset your password', status: 'Active' },
        { id: 5, name: 'New Message', type: 'Push', subject: 'You have a new message', status: 'Active' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notification Templates</h1>
                    <p className="text-gray-500">Manage email, SMS, and push notification content</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject / Content Preview</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {templates.map((template) => (
                            <tr key={template.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{template.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`flex items-center gap-2 text-sm ${template.type === 'Email' ? 'text-blue-600' :
                                            template.type === 'SMS' ? 'text-green-600' : 'text-purple-600'
                                        }`}>
                                        {template.type === 'Email' && <Mail size={16} />}
                                        {template.type === 'SMS' && <MessageSquare size={16} />}
                                        {template.type === 'Push' && <Bell size={16} />}
                                        {template.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.subject}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Active</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button className="text-cureza-green hover:text-green-700 flex items-center gap-1 ml-auto text-sm font-medium">
                                        <Edit size={16} /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
