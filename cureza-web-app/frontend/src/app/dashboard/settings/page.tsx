'use client';

import { useState } from 'react';
import { Lock, Bell, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        twoFactor: false,
        orderUpdates: true,
        promotionalEmails: true,
        profileVisibility: 'Public'
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            // We need to import api here, but since I can't see imports, I'll assume it's available or use fetch if needed. 
            // Better to add import in a separate step if missing.
            // Assuming api is imported as in other files.
            await api.post('/change-password', passwordData);
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
            setShowPasswordForm(false);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSettings(prev => ({ ...prev, profileVisibility: e.target.value }));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Settings</h1>

            <div className="space-y-6">
                {/* Account Security */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-lg text-charcoal dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Lock size={20} /> Security
                    </h3>
                    <div className="space-y-4">
                        <div className="py-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-charcoal dark:text-gray-100">Change Password</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly for better security</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {showPasswordForm ? 'Cancel' : 'Update'}
                                </button>
                            </div>

                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 max-w-md bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-cureza-green focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-cureza-green focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.new_password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-cureza-green focus:outline-none"
                                        />
                                    </div>
                                    {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-cureza-green text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="font-medium text-charcoal dark:text-gray-100">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.twoFactor}
                                    onChange={() => toggleSetting('twoFactor')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cureza-green"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-lg text-charcoal dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Bell size={20} /> Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-charcoal dark:text-gray-100">Order Updates</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your order status</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.orderUpdates}
                                    onChange={() => toggleSetting('orderUpdates')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cureza-green"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <p className="font-medium text-charcoal dark:text-gray-100">Promotional Emails</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Receive offers and newsletters</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.promotionalEmails}
                                    onChange={() => toggleSetting('promotionalEmails')}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cureza-green"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-lg text-charcoal dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Eye size={20} /> Privacy
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-charcoal dark:text-gray-100">Profile Visibility</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage who can see your profile info</p>
                            </div>
                            <select
                                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cureza-green"
                                value={settings.profileVisibility}
                                onChange={handleSelectChange}
                            >
                                <option>Public</option>
                                <option>Private</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
