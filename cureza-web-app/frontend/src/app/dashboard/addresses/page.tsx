'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit2, X, Home, Briefcase } from 'lucide-react';
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

        // Basic Pincode Validation
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Address Book</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your saved addresses ({addresses.length}/5)</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={addresses.length >= 5}
                    className="flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} /> Add New Address
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No addresses found</h3>
                    <p className="text-gray-500 mt-1">Add a new address to manage your delivery locations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div key={address.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(address)}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex items-start gap-3 mb-4">
                                {address.type === 'work' ? (
                                    <Briefcase className="text-gray-400 mt-1" size={20} />
                                ) : (
                                    <Home className="text-cureza-green mt-1" size={20} />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${address.type === 'home'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {address.type}
                                        </span>
                                        {address.is_default && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-charcoal dark:text-gray-100">{address.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {address.address_line_1}, <br />
                                        {address.address_line_2 && <>{address.address_line_2}, <br /></>}
                                        {address.city}, {address.state} - {address.zip}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                        <strong>Phone:</strong> {address.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-cureza-green focus:ring-cureza-green"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-cureza-green focus:ring-cureza-green"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 1</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="House No, Building Name"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-cureza-green focus:ring-cureza-green"
                                        value={formData.address_line_1}
                                        onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2 (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Street Name, Area"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-cureza-green focus:ring-cureza-green"
                                        value={formData.address_line_2}
                                        onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                    <select
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-cureza-green focus:ring-cureza-green"
                                        value={formData.state}
                                        onChange={handleStateChange}
                                    >
                                        <option value="">Select State</option>
                                        {Object.keys(indianLocations).map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <select
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-cureza-green focus:ring-cureza-green"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        disabled={!formData.state}
                                    >
                                        <option value="">Select City</option>
                                        {formData.state && indianLocations[formData.state]?.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        placeholder="6-digit Pincode"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:border-cureza-green focus:ring-cureza-green"
                                        value={formData.zip}
                                        onChange={(e) => setFormData({ ...formData, zip: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="home"
                                                checked={formData.type === 'home'}
                                                onChange={() => setFormData({ ...formData, type: 'home' })}
                                                className="text-cureza-green focus:ring-cureza-green"
                                            />
                                            <span>Home</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="work"
                                                checked={formData.type === 'work'}
                                                onChange={() => setFormData({ ...formData, type: 'work' })}
                                                className="text-cureza-green focus:ring-cureza-green"
                                            />
                                            <span>Work</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                            className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Set as default address</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                                >

                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-cureza-green text-white hover:bg-green-700 transition-colors font-medium"
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
