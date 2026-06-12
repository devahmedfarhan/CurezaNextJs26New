'use client';

import { Clock, User, ShieldAlert, Search } from 'lucide-react';

export default function AdminLogsPage() {
    const logs = [
        { id: 1, action: 'Login Success', user: 'Super Admin', ip: '192.168.1.1', time: 'Just now', type: 'info' },
        { id: 2, action: 'Updated Product #1024', user: 'Content Editor', ip: '192.168.1.45', time: '10 mins ago', type: 'info' },
        { id: 3, action: 'Failed Login Attempt', user: 'Unknown', ip: '45.22.11.90', time: '1 hour ago', type: 'warning' },
        { id: 4, action: 'Deleted User #55', user: 'Super Admin', ip: '192.168.1.1', time: '2 hours ago', type: 'danger' },
        { id: 5, action: 'System Backup Created', user: 'System', ip: 'localhost', time: '02:00 AM', type: 'success' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-500">Track system activity and security events</p>
                </div>
                <button className="text-blue-600 hover:underline text-sm font-medium">Export Logs</button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs by user, action, or IP..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/50"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${log.type === 'danger' ? 'bg-red-100 text-red-600' :
                                                log.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                                    log.type === 'success' ? 'bg-green-100 text-green-600' :
                                                        'bg-blue-100 text-blue-600'
                                            }`}>
                                            {log.type === 'warning' || log.type === 'danger' ? <ShieldAlert size={14} /> : <Clock size={14} />}
                                        </div>
                                        <span className="font-medium text-gray-900">{log.action}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                                    <User size={14} /> {log.user}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.ip}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
