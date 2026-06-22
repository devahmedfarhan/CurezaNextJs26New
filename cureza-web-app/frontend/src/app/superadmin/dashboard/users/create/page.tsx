'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Stethoscope, ShoppingBag, Lock, Mail, Phone, Globe, MapPin, Building } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

function CreateUserPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'seller' | 'doctor' | 'customer'>('seller');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // Params
    const mode = searchParams.get('mode') || 'create';
    const id = searchParams.get('id');
    const isEdit = mode === 'edit' && !!id;

    useEffect(() => {
        const type = searchParams.get('type');
        if (type && ['seller', 'doctor', 'customer'].includes(type)) {
            setActiveTab(type as any);
        }
    }, [searchParams]);

    // Common State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // Seller Specific
    const [brandName, setBrandName] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');

    // Reset or Fetch on mount/tab change
    useEffect(() => {
        if (!isEdit) {
            // Reset if creating
            setName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setBrandName('');
            setWebsite('');
            setAddress('');
        } else {
            // Fetch if editing
            fetchUserData();
        }
    }, [activeTab, isEdit, id]);

    const fetchUserData = async () => {
        setIsFetching(true);
        try {
            const endpoint = `/admin/${activeTab}s/${id}`;
            const response = await api.get(endpoint);
            const data = response.data;

            if (activeTab === 'seller') {
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setBrandName(data.name);
                setWebsite(data.profile?.has_website || '');
                setAddress(data.profile?.address_line_1 || '');
            } else if (activeTab === 'doctor') {
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
            } else if (activeTab === 'customer') {
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
            }

        } catch (error) {
            console.error(error);
            showToast('Failed to fetch user data', 'error');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let endpoint = '';
            let payload: any = {
                email,
                phone,
            };

            if (!isEdit) {
                payload.password = password;
            }

            if (activeTab === 'seller') {
                endpoint = isEdit ? `/admin/users/update-seller/${id}` : '/admin/users/create-seller';
                payload.name = brandName;
                payload.brand_name = brandName;
                payload.website = website;
                payload.address = address;
            } else if (activeTab === 'doctor') {
                endpoint = isEdit ? `/admin/users/update-doctor/${id}` : '/admin/users/create-doctor';
                payload.name = name;
            } else if (activeTab === 'customer') {
                endpoint = isEdit ? `/admin/users/update-customer/${id}` : '/admin/users/create-customer';
                payload.name = name;
            }

            if (isEdit) {
                await api.put(endpoint, payload);
                showToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} updated successfully`, 'success');
            } else {
                await api.post(endpoint, payload);
                showToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} created successfully`, 'success');
            }

            router.push(`/superadmin/dashboard/users/${activeTab}s`);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`;
            const errors = error.response?.data?.errors;

            if (errors) {
                const firstError = Object.values(errors)[0] as string[];
                showToast(firstError[0] || msg, 'error');
            } else {
                showToast(msg, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="p-12 text-center text-xs font-medium text-neutral-450 animate-pulse">Loading user data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            
            <div>
                <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
                    {isEdit ? 'Edit User Profile' : 'Create New User Profile'}
                </h1>
                <p className="text-neutral-500 text-xs font-normal mt-1">Register customer, corporate merchant, or clinical practitioner details.</p>
            </div>


            <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden shadow-none">
                {/* Tabs */}
                <div className="flex border-b-[0.5px] border-black/50">
                    <button
                        type="button"
                        onClick={() => !isEdit && setActiveTab('seller')}
                        disabled={isEdit}
                        className={`flex-1 py-4 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'seller'
                            ? 'text-neutral-900 border-b-[0.5px] border-black bg-neutral-50/50'
                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                            } ${isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ShoppingBag size={14} />
                        Seller (Brand)
                    </button>
                    <button
                        type="button"
                        onClick={() => !isEdit && setActiveTab('doctor')}
                        disabled={isEdit}
                        className={`flex-1 py-4 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'doctor'
                            ? 'text-neutral-900 border-b-[0.5px] border-black bg-neutral-50/50'
                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                            } ${isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <Stethoscope size={14} />
                        Doctor
                    </button>
                    <button
                        type="button"
                        onClick={() => !isEdit && setActiveTab('customer')}
                        disabled={isEdit}
                        className={`flex-1 py-4 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'customer'
                            ? 'text-neutral-900 border-b-[0.5px] border-black bg-neutral-50/50'
                            : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                            } ${isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <User size={14} />
                        Customer
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">

                        {/* Common Fields */}
                        {(activeTab === 'doctor' || activeTab === 'customer') && (
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-xs font-normal text-neutral-850"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'seller' && (
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Brand Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-xs font-normal text-neutral-850"
                                        placeholder="Awesome Brand"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input
                                        type="email"
                                        required
                                        readOnly={isEdit}
                                        className={`w-full pl-10 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-xs font-normal text-neutral-850 ${isEdit ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed border-black/50' : ''}`}
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {isEdit && <p className="text-[10px] text-neutral-400 mt-1">Email cannot be changed.</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-xs font-normal text-neutral-850"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input
                                        type="text"
                                        required
                                        minLength={8}
                                        className="w-full pl-10 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-xs font-normal text-neutral-855"
                                        placeholder="Min 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <p className="text-[10px] text-neutral-400 mt-1">Visible so you can copy and send to the user.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seller' && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Website (Optional)</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                        <input
                                            type="url"
                                            className="w-full pl-10 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-xs font-normal text-neutral-850"
                                            placeholder="https://example.com"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Registered Address (Optional)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-neutral-400" size={16} />
                                        <textarea
                                            className="w-full pl-10 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all text-xs font-normal text-neutral-850"
                                            rows={3}
                                            placeholder="Brand registered address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4 flex items-center justify-end gap-3 border-t-[0.5px] border-black/50">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border-[0.5px] border-black/50 rounded-[10px] text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 rounded-[10px] bg-black text-white font-medium hover:bg-neutral-900 transition-colors text-xs shadow-none disabled:opacity-55 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? `Update Profile` : `Create Profile`)}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default function CreateUserPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-[0.5px] border-black" />
            </div>
        }>
            <CreateUserPageContent />
        </Suspense>
    );
}
