'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Save, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Image from 'next/image';

export default function ProfilePage() {
    const { user, mutate } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            console.log('ProfilePage User:', user); // DEBUG
            setName(user.name || '');
            setPhone(user.phone || '');
            setPreviewUrl(user.profile_image_url || null);
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            // Create local preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', user?.email || ''); // Email is usually immutable or requires separate validation
        formData.append('phone', phone);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            const res = await api.post('/user/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);

            // Update Auth Context with new user data
            mutate();

        } catch (err: any) {
            console.error('Profile update failed', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">My Profile</h1>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => isEditing && fileInputRef.current?.click()}>
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center text-4xl border-4 border-white dark:border-gray-800 shadow-sm relative">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{name ? name.charAt(0).toUpperCase() : '👤'}</span>
                            )}

                            {/* Overlay when editing */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 bg-cureza-green text-white p-2 rounded-full shadow-md hover:bg-green-700 transition-colors pointer-events-none"
                            >
                                <Camera size={16} />
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-charcoal dark:text-gray-100">{user?.name || 'Guest'}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>

                {/* Form */}
                <form className="space-y-6 max-w-2xl mx-auto" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditing}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-charcoal dark:text-gray-100 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-cureza-green disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 py-2.5 px-3 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={!isEditing}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-charcoal dark:text-gray-100 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-cureza-green disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        {isEditing ? (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset fields
                                        setName(user?.name || '');
                                        setPhone(user?.phone || '');
                                        setPreviewUrl(user?.profile_image || null);
                                        setAvatarFile(null);
                                    }}
                                    className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg bg-cureza-green text-white hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 rounded-lg bg-cureza-green text-white hover:bg-green-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
