'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Shield, ShieldCheck, Lock as LockIcon } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login form submitted'); // DEBUG
        setError('');
        setLoading(true);

        try {
            console.log('Skipping CSRF check (Token Auth Mode)'); // DEBUG
            // await api.get('/sanctum/csrf-cookie', { baseURL: '/' }); 

            console.log('Sending login request to /admin/login...', { email }); // DEBUG
            const response = await api.post(`/admin/login?_ts=${Date.now()}`, { email, password });
            console.log('Login response received:', response.status, response.data); // DEBUG

            showToast('Admin login successful!', 'success');
            login(response.data.access_token, response.data.user);
            router.push('/superadmin/dashboard');
        } catch (err: any) {
            console.error('Login error full object:', err); // DEBUG
            console.error('Login error response:', err.response); // DEBUG
            setError(err.response?.data?.message || 'Login failed. Admin access required.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-warm-sand">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="text-3xl font-bold flex items-center gap-2 mb-12">
                        <span className="bg-white text-gray-900 p-1 rounded">Cz</span>
                        Cureza Admin
                    </Link>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Super Admin<br />
                        Control Panel.
                    </h1>
                    <p className="text-xl text-gray-300 max-w-lg mb-8">
                        Manage the entire Cureza platform with administrative privileges.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full"><Shield size={20} /></div>
                            <span className="font-medium">Full Platform Control</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full"><ShieldCheck size={20} /></div>
                            <span className="font-medium">User Management</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full"><LockIcon size={20} /></div>
                            <span className="font-medium">Secure Access</span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-sm text-gray-400">© 2025 Cureza Wellness Pvt Ltd.</div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10"><Shield size={400} /></div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-charcoal">Admin Login</h2>
                        <p className="mt-2 text-sm text-gray-600">Access the super admin dashboard</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="admin@cureza.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-gray-900 py-2.5 px-4 text-sm font-bold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign in to Admin Panel'}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm border-t border-gray-100 pt-4">
                        <span className="text-gray-600">Not an admin? </span>
                        <Link href="/login" className="font-bold text-cureza-green hover:text-green-700 transition-colors">
                            Customer Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
