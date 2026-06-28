'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit2, X, Home, Briefcase, User, Phone, Navigation, Building2, Globe, ShieldCheck } from 'lucide-react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Address {
    id: number;
    name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    type: 'home' | 'work';
    is_default: boolean;
}

import { indianLocations } from '@/data/indianLocations';

export default function AddressBookPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const { showToast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        type: 'home',
        is_default: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await axios.get('/addresses');
            if (Array.isArray(response.data)) {
                setAddresses(response.data);
            } else {
                console.error('API response is not an array:', response.data);
                setAddresses([]);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            showToast('Failed to load addresses', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                name: address.name,
                phone: address.phone,
                address_line_1: address.address_line_1,
                address_line_2: address.address_line_2 || '',
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country,
                type: address.type as 'home' | 'work',
                is_default: address.is_default
            });
        } else {
            if (addresses.length >= 5) {
                showToast('You can only add up to 5 addresses. Please delete one to add a new address.', 'error');
                return;
            }
            setEditingAddress(null);
            setFormData({
                name: '',
                phone: '',
                address_line_1: '',
                address_line_2: '',
                city: '',
                state: '',
                zip: '',
                country: 'India',
                type: 'home',
                is_default: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Regex Validations
        const nameTrimmed = formData.name.trim();
        const nameRegex = /^[a-zA-Z\s.]{2,50}$/;
        if (!nameRegex.test(nameTrimmed)) {
            showToast('Please enter a valid name (2-50 characters, letters only)', 'error');
            return;
        }

        const phoneTrimmed = formData.phone.trim();
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneTrimmed)) {
            showToast('Please enter a valid 10-digit Indian phone number', 'error');
            return;
        }

        if (!/^\d{6}$/.test(formData.zip)) {
            showToast('Please enter a valid 6-digit Pincode', 'error');
            return;
        }

        try {
            if (editingAddress) {
                await axios.put(`/addresses/${editingAddress.id}`, formData);
                showToast('Address updated successfully', 'success');
            } else {
                await axios.post('/addresses', formData);
                showToast('Address added successfully', 'success');
            }
            setIsModalOpen(false);
            fetchAddresses();
        } catch (error: any) {
            console.error('Failed to save address:', error);
            showToast(error.response?.data?.message || 'Failed to save address', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this address?')) {
            try {
                await axios.delete(`/addresses/${id}`);
                showToast('Address deleted successfully', 'success');
                fetchAddresses();
            } catch (error) {
                console.error('Failed to delete address:', error);
                showToast('Failed to delete address', 'error');
            }
        }
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, state: e.target.value, city: '' });
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading addresses...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#052326] dark:text-gray-100 tracking-tight">Address Book</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage your saved addresses ({addresses.length}/5)</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={addresses.length >= 5}
                    className="flex items-center gap-2 bg-[#052326] text-white hover:bg-[#0b4435] px-4 py-2.5 rounded-[8px] text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
                >
                    <Plus size={14} /> Add New Address
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-[8px] border border-[#555555]/18 shadow-none">
                    <MapPin className="mx-auto h-10 w-10 text-[#052326]/20 mb-4 animate-pulse" />
                    <h3 className="text-sm font-semibold text-[#052326] dark:text-gray-200">No addresses found</h3>
                    <p className="text-xs text-gray-500 mt-1">Add a new address to manage your delivery locations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div key={address.id} className="bg-white dark:bg-gray-900 p-6 rounded-[8px] border border-[#555555]/18 hover:border-black/30 dark:hover:border-white/20 transition-all shadow-none relative group flex flex-col justify-between min-h-[160px]">
                            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(address)}
                                    className="p-2 text-gray-400 hover:text-[#052326] hover:bg-[#052326]/5 rounded-full transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex items-start gap-3.5">
                                <div className="mt-1 shrink-0 p-2 bg-[#052326]/5 rounded-[6px]">
                                    {address.type === 'work' ? (
                                        <Briefcase className="text-[#052326]" size={16} />
                                    ) : (
                                        <Home className="text-[#052326]" size={16} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        {address.type === 'home' ? (
                                            <span className="bg-[#052326]/10 text-[#052326] dark:bg-white/10 dark:text-gray-200 text-[9px] font-bold px-2 py-0.5 rounded-[4px] border-[0.5px] border-[#052326]/10 dark:border-white/10 uppercase tracking-wider">
                                                Home
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded-[4px] border-[0.5px] border-gray-200/50 dark:border-white/5 uppercase tracking-wider">
                                                Work
                                            </span>
                                        )}
                                        {address.is_default && (
                                            <span className="bg-[#052326] text-white text-[9px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider shadow-sm">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-sm text-[#052326] dark:text-gray-100 truncate">{address.name}</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed break-words">
                                        {address.address_line_1}
                                        {address.address_line_2 && <>, {address.address_line_2}</>}
                                        <br />
                                        {address.city}, {address.state} - {address.zip}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1">
                                        <span className="font-bold text-[#052326]/40 dark:text-gray-400 uppercase tracking-wider text-[9px]">Phone:</span> 
                                        <span className="font-medium text-[#052326]/80 dark:text-gray-200">{address.phone}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[8px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-none border border-[#555555]/18 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-8 py-6 border-b-[0.5px] border-black/10 dark:border-white/5 sticky top-0 bg-white dark:bg-gray-900 z-10">
                            <h2 className="text-base font-semibold text-[#052326] dark:text-gray-100 tracking-tight">
                                {editingAddress ? 'Edit Delivery Address' : 'Add New Address'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-[#052326]/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* SECTION 1: Contact Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-[#052326]/40 dark:text-gray-500 uppercase tracking-wider pb-2 border-b-[0.5px] border-black/10 dark:border-white/5">
                                    Contact Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <User size={12} className="text-[#052326]/40" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all text-[#052326] dark:text-gray-100"
                                            placeholder="Recipient name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <Phone size={12} className="text-[#052326]/40" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all text-[#052326] dark:text-gray-100"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Address Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-[#052326]/40 dark:text-gray-500 uppercase tracking-wider pb-2 border-b-[0.5px] border-black/10 dark:border-white/5">
                                    Address Details
                                </h3>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <MapPin size={12} className="text-[#052326]/40" />
                                            Address Line 1
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.address_line_1}
                                            onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                                            placeholder="Flat / House No., Building, Apartment, Area"
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all text-[#052326] dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <MapPin size={12} className="text-[#052326]/40" />
                                            Address Line 2 (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address_line_2}
                                            onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                                            placeholder="Street Name, Landmark, Sector"
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all text-[#052326] dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Navigation size={12} className="text-[#052326]/40" />
                                                State
                                            </label>
                                            <select
                                                required
                                                value={formData.state}
                                                onChange={handleStateChange}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all text-[#052326] dark:text-gray-100"
                                            >
                                                <option value="">Select State</option>
                                                {Object.keys(indianLocations).map((state) => (
                                                    <option key={state} value={state}>{state}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Building2 size={12} className="text-[#052326]/40" />
                                                City
                                            </label>
                                            <select
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                disabled={!formData.state}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 text-[#052326] dark:text-gray-100"
                                            >
                                                <option value="">Select City</option>
                                                {formData.state && indianLocations[formData.state]?.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Navigation size={12} className="text-[#052326]/40" />
                                                Pincode
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                placeholder="6-digit PIN"
                                                value={formData.zip}
                                                onChange={(e) => setFormData({ ...formData, zip: e.target.value.replace(/\D/g, '') })}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all text-[#052326] dark:text-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Globe size={12} className="text-[#052326]/40" />
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                value={formData.country}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/15 bg-[#052326]/[0.03] dark:bg-gray-800/20 text-sm font-medium text-[#052326]/60 dark:text-gray-400 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: Address Options */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold text-[#052326]/40 dark:text-gray-500 uppercase tracking-wider pb-2 border-b-[0.5px] border-black/10 dark:border-white/5">
                                    Settings
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#052326]/[0.02] p-4 rounded-[8px] border border-[#555555]/18">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400 block">
                                            Address Type
                                        </label>
                                        <div className="flex gap-2 p-1 bg-[#052326]/5 rounded-[8px] w-fit border border-[#555555]/18">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'home' })}
                                                className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all ${
                                                    formData.type === 'home'
                                                        ? 'bg-[#052326] text-white'
                                                        : 'text-[#052326]/60 hover:text-[#052326]'
                                                }`}
                                            >
                                                Home
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'work' })}
                                                className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all ${
                                                    formData.type === 'work'
                                                        ? 'bg-[#052326] text-white shadow-sm'
                                                        : 'text-[#052326]/60 hover:text-[#052326]'
                                                }`}
                                            >
                                                Work
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 self-end sm:self-center h-full pt-4 sm:pt-0">
                                        <input
                                            type="checkbox"
                                            id="is_default"
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                            className="w-4 h-4 rounded-[4px] border-[0.5px] border-black/50 text-[#052326] focus:ring-[#052326] accent-[#052326] cursor-pointer"
                                        />
                                        <label 
                                            htmlFor="is_default" 
                                            className="text-xs font-bold text-[#052326]/80 dark:text-gray-300 cursor-pointer select-none"
                                        >
                                            Set as default address
                                        </label>
                                    </div>
                                </div>
                            </div>

                             <div className="flex justify-end gap-3 pt-6 border-t-[0.5px] border-black/10 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-[8px] border border-[#555555]/18 hover:bg-[#052326]/5 text-[#052326] dark:text-gray-200 text-xs font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-[8px] bg-[#052326] text-white hover:bg-[#0b4435] transition-all text-xs font-semibold shadow-none"
                                >
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
