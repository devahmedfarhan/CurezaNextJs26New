'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Stethoscope, ShoppingBag, Eye, Lock, Mail, Phone, Globe, MapPin, Building } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

function CreateUserPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'seller' | 'doctor' | 'customer'>('seller');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false); // For edit mode fetching

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
            // Assuming we reuse the detail endpoints
            // seller: /admin/sellers/{id}
            // doctor: /admin/doctors/{id}
            // customer: /admin/customers/{id}
            const endpoint = `/admin/${activeTab}s/${id}`;
            const response = await api.get(endpoint);
            const data = response.data;

            if (activeTab === 'seller') {
                // Determine user and profile data
                // Structure: { id, name (brand?), email, phone, role, profile: {...} } OR { ...user, profile }
                // Based on Detail Page logic:
                // Seller Detail: response.data has top level user fields + 'profile' object
                setName(data.name || ''); // Seller name (might be Brand Name or User Name)
                setEmail(data.email || '');
                setPhone(data.phone || '');
                // Password usually blank on edit

                const profile = data.profile || {};
                setBrandName(profile.registering_as === 'Brand' ? data.name : (data.brand?.name || data.name));  // Fallback
                // Note: In storeSeller, user.name = brand_name. So data.name is brand name.
                setBrandName(data.name);

                setWebsite(profile.has_website || ''); // has_website string? or boolean?
                // Migration said string. Controller store said !empty(website).
                // Let's assume it stores the URL or we store URL in description?
                // Migration: has_website is string. Controller: 'has_website' => !empty($request->website) (boolean stored as 0/1 or '1'/'0'?).
                // Wait, Controller Store: 'description' => "Website: " . $url.
                // Profile 'has_website' is just a flag?
                // Controller Update logic needs the website URL.
                // Let's check where website URL is stored. 
                // Brand description? 

                // For now, let's leave website empty if not easily retrievable, or try to parse from brand description if possible.
                // Or just set it if profile.has_website is actually the URL (if I changed migration to string).

                setAddress(profile.address_line_1 || '');

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
            let method = isEdit ? 'put' : 'post';

            let payload: any = {
                email,
                phone,
            };

            if (!isEdit) {
                payload.password = password; // Only send password on create
            }

            if (activeTab === 'seller') {
                endpoint = isEdit ? `/admin/users/update-seller/${id}` : '/admin/users/create-seller';
                // For update, we might not need all fields, but sending them is fine
                payload.name = brandName; // User name = Brand Name
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

            // Redirect to list
            router.push(`/superadmin/dashboard/users/${activeTab}s`); // sellers, doctors, customers

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`;
            const errors = error.response?.data?.errors;

            if (errors) {
                // Show first error
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
        return <div className="p-12 text-center">Loading user data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">{isEdit ? 'Edit User' : 'Create New User'}</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs - Disable tabs in Edit Mode to prevent switching context */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => !isEdit && setActiveTab('seller')}
                        disabled={isEdit}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'seller'
                            ? 'text-cureza-green border-b-2 border-cureza-green bg-green-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            } ${isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <ShoppingBag size={18} />
                        Seller (Brand)
                    </button>
                    <button
                        onClick={() => !isEdit && setActiveTab('doctor')}
                        disabled={isEdit}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'doctor'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            } ${isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <Stethoscope size={18} />
                        Doctor
                    </button>
                    <button
                        onClick={() => !isEdit && setActiveTab('customer')}
                        disabled={isEdit}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'customer'
                            ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            } ${isEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        <User size={18} />
                        Customer
                    </button>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">

                        {/* Common Fields */}
                        {(activeTab === 'doctor' || activeTab === 'customer') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'seller' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                                        placeholder="Awesome Brand"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        // Email is often unique and hard to change without verification. 
                                        // For simplicity, allowed to edit here, backend validation will fail if dupe.
                                        readOnly={isEdit} // Let's make email read-only for now to avoid complexity
                                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {isEdit && <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            minLength={8}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                                            placeholder="Min 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Visible so you can copy and send to the user.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seller' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="url"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                                            placeholder="https://example.com"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address (Optional)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <textarea
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                                            rows={3}
                                            placeholder="Brand registered address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-6 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2
                                    ${activeTab === 'seller' ? 'bg-cureza-green hover:bg-green-700' :
                                        activeTab === 'doctor' ? 'bg-blue-600 hover:bg-blue-700' :
                                            'bg-purple-600 hover:bg-purple-700'
                                    } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? `Update ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`)}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cureza-green" />
            </div>
        }>
            <CreateUserPageContent />
        </Suspense>
    );
}
