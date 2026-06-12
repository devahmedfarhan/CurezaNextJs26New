'use client';

import { Server, Download, AlertTriangle, ToggleRight, Database } from 'lucide-react';

export default function AdminSystemPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System & Maintenance</h1>
                    <p className="text-gray-500">Backup data and manage maintenance mode</p>
                </div>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-yellow-500">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Maintenance Mode</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-md">
                                When enabled, the public website will be inaccessible to visitors. Only admins can access the dashboard.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">Off</span>
                        <ToggleRight size={48} className="text-gray-300 cursor-pointer rotate-180" />
                    </div>
                </div>
            </div>

            {/* Backup */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Database Backup</h3>
                        <p className="text-sm text-gray-500">Last backup: Today, 02:00 AM (Automated)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Server size={20} className="text-gray-500" />
                            <span className="font-medium text-gray-900">cureza_db_backup_2025_11_26.sql</span>
                            <span className="text-xs text-gray-500">45 MB</span>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                            <Download size={16} /> Download
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Server size={20} className="text-gray-500" />
                            <span className="font-medium text-gray-900">cureza_db_backup_2025_11_25.sql</span>
                            <span className="text-xs text-gray-500">44 MB</span>
                        </div>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                            <Download size={16} /> Download
                        </button>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                        <Database size={16} />
                        Create Manual Backup
                    </button>
                </div>
            </div>
        </div>
    );
}
