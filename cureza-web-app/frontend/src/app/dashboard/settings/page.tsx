'use client';

import { useState } from 'react';
import { Lock, Bell, Eye } from 'lucide-react';
import api from '@/lib/api';

export default function SettingsPage() {
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('customer_settings');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse customer settings', e);
                }
            }
        }
        return {
            twoFactor: false,
            orderUpdates: true,
            promotionalEmails: true,
            profileVisibility: 'Public'
        };
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
        setSettings(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            if (typeof window !== 'undefined') {
                localStorage.setItem('customer_settings', JSON.stringify(updated));
            }
            return updated;
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSettings(prev => {
            const updated = { ...prev, profileVisibility: val };
            if (typeof window !== 'undefined') {
                localStorage.setItem('customer_settings', JSON.stringify(updated));
            }
            return updated;
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>

            <div className="space-y-6">
                {/* Account Security */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-extrabold text-lg text-gray-900 mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-gray-400" /> Security
                    </h3>
                    <div className="space-y-6">
                        <div className="py-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-extrabold text-gray-900">Change Password</p>
                                    <p className="text-sm text-gray-500 font-medium">Update your password regularly for better security</p>
                                </div>
                                <button
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-extrabold hover:bg-gray-50 transition-colors"
                                >
                                    {showPasswordForm ? 'Cancel' : 'Update'}
                                </button>
                            </div>

                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="mt-6 space-y-4 max-w-md bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1 px-1">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                            className="block w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-cureza-green/50 outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1 px-1">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                            className="block w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-cureza-green/50 outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1 px-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwordData.new_password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                            className="block w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:ring-2 focus:ring-cureza-green/50 outline-none font-medium"
                                        />
                                    </div>
                                    {message && <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gray-900 text-white py-3 rounded-2xl font-extrabold hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-gray-200"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-4 border-t border-gray-100">
                            <div>
                                <p className="font-extrabold text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500 font-medium">Add an extra layer of security to your account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.twoFactor}
                                    onChange={() => toggleSetting('twoFactor')}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-extrabold text-lg text-gray-900 mb-6 flex items-center gap-2">
                        <Bell size={20} className="text-gray-400" /> Notifications
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-extrabold text-gray-900">Order Updates</p>
                                <p className="text-sm text-gray-500 font-medium">Receive updates about your order status</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.orderUpdates}
                                    onChange={() => toggleSetting('orderUpdates')}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-4 border-t border-gray-100">
                            <div>
                                <p className="font-extrabold text-gray-900">Promotional Emails</p>
                                <p className="text-sm text-gray-500 font-medium">Receive offers and newsletters</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.promotionalEmails}
                                    onChange={() => toggleSetting('promotionalEmails')}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="font-extrabold text-lg text-gray-900 mb-6 flex items-center gap-2">
                        <Eye size={20} className="text-gray-400" /> Privacy
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-extrabold text-gray-900">Profile Visibility</p>
                                <p className="text-sm text-gray-500 font-medium">Manage who can see your profile info</p>
                            </div>
                            <select
                                className="bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cureza-green/50 font-bold"
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
