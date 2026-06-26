'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Save, Loader, User, Mail, Phone, ShieldCheck, Calendar, MapPin, Globe, Navigation, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ProfilePage() {
    const { user, mutate } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [hasGst, setHasGst] = useState(false);
    const [gstNumber, setGstNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setPreviewUrl(user.profile_image_url || null);
            setDateOfBirth(user.date_of_birth || '');
            setGender(user.gender || '');
            setAddress(user.address || '');
            setCity(user.city || '');
            setState(user.state || '');
            setCountry(user.country || '');
            setPostalCode(user.postal_code || '');
            setHasGst(!!user.gst_number);
            setGstNumber(user.gst_number || '');
            setCompanyName(user.company_name || '');
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
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
        formData.append('email', user?.email || '');
        formData.append('phone', phone);
        formData.append('date_of_birth', dateOfBirth);
        formData.append('gender', gender);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('state', state);
        formData.append('country', country);
        formData.append('postal_code', postalCode);
        formData.append('gst_number', hasGst ? gstNumber : '');
        formData.append('company_name', hasGst ? companyName : '');
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            await api.post('/user/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            mutate();
        } catch (err: any) {
            console.error('Profile update failed', err);
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(' ') 
                : err.response?.data?.message || 'Failed to update profile.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#052326] dark:text-gray-100 tracking-tight">My Profile</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage and update your personal information and contact details.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
                {/* Alert Notification */}
                {message && (
                    <div className={`p-4 border-b-[0.5px] ${
                        message.type === 'success' 
                            ? 'bg-[#052326]/5 text-[#052326] border-[#052326]/10' 
                            : 'bg-red-50 text-red-700 border-red-100'
                    } text-xs font-semibold flex items-center gap-2 transition-all`}>
                        <ShieldCheck size={16} className={message.type === 'success' ? 'text-[#052326]' : 'text-red-500'} />
                        {message.text}
                    </div>
                )}

                <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        {/* LEFT COLUMN: Avatar & Quick Info */}
                        <div className="w-full lg:w-64 shrink-0 flex flex-col items-center p-6 bg-[#052326]/[0.02] dark:bg-gray-800/20 rounded-[10px] border-[0.5px] border-black/10 dark:border-white/5">
                            <div 
                                className={`relative group ${isEditing ? 'cursor-pointer' : ''}`} 
                                onClick={() => isEditing && fileInputRef.current?.click()}
                            >
                                <div className="w-28 h-28 bg-[#052326] text-white rounded-[10px] overflow-hidden flex items-center justify-center font-bold text-3xl border-[0.5px] border-black/20 shadow-md relative">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-[#F8F3EF] tracking-wider select-none font-bold">
                                            {name 
                                                ? name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
                                                : 'U'}
                                        </span>
                                    )}

                                    {/* Overlay when editing */}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="absolute bottom-0 right-0 bg-[#052326] text-[#F8F3EF] p-2 rounded-full shadow-md border-[0.5px] border-black/10 transition-transform group-hover:scale-105">
                                        <Camera size={14} />
                                    </div>
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
                            
                            <h2 className="mt-4 text-base font-bold text-[#052326] dark:text-gray-100 text-center tracking-tight truncate max-w-full">
                                {user?.name || 'User'}
                            </h2>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center truncate max-w-full mt-0.5 font-medium">
                                {user?.email}
                            </p>
                            
                            <div className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-bold bg-[#052326]/10 dark:bg-white/10 text-[#052326] dark:text-gray-200 px-2.5 py-1 rounded-[4px] border-[0.5px] border-[#052326]/10 dark:border-white/10 uppercase tracking-wider">
                                <span>Verified Member</span>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Form Fields */}
                        <form className="flex-1 w-full space-y-8" onSubmit={handleSubmit}>
                            {/* SECTION 1: Personal Information */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-[#052326]/40 dark:text-gray-500 uppercase tracking-wider pb-2 border-b-[0.5px] border-black/10 dark:border-white/5">
                                    Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <User size={12} className="text-[#052326]/40" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <Mail size={12} className="text-[#052326]/40" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/15 bg-[#052326]/[0.03] dark:bg-gray-800/20 text-sm font-medium text-[#052326]/60 dark:text-gray-400 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <Phone size={12} className="text-[#052326]/40" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                            placeholder="Your phone number"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <Calendar size={12} className="text-[#052326]/40" />
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <User size={12} className="text-[#052326]/40" />
                                            Gender
                                        </label>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Address Details */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-xs font-bold text-[#052326]/40 dark:text-gray-500 uppercase tracking-wider pb-2 border-b-[0.5px] border-black/10 dark:border-white/5">
                                    Billing Address
                                </h3>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                            <MapPin size={12} className="text-[#052326]/40" />
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                            placeholder="House / Apartment number, building, street, area"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Building2 size={12} className="text-[#052326]/40" />
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                                placeholder="City name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Navigation size={12} className="text-[#052326]/40" />
                                                State / Region
                                            </label>
                                            <input
                                                type="text"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                                placeholder="State name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Globe size={12} className="text-[#052326]/40" />
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                                placeholder="Country name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                <Navigation size={12} className="text-[#052326]/40" />
                                                Postal / Pincode
                                            </label>
                                            <input
                                                type="text"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                                placeholder="Pincode or Zipcode"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: GST Details */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-xs font-bold text-[#052326]/40 dark:text-gray-500 uppercase tracking-wider pb-2 border-b-[0.5px] border-black/10 dark:border-white/5">
                                    GST Billing Details
                                </h3>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="hasGst"
                                            checked={hasGst}
                                            onChange={(e) => {
                                                if (isEditing) {
                                                    setHasGst(e.target.checked);
                                                }
                                            }}
                                            disabled={!isEditing}
                                            className="w-4 h-4 rounded-[4px] border-[0.5px] border-black/50 text-[#052326] focus:ring-[#052326] disabled:opacity-50 accent-[#052326] cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <label 
                                            htmlFor="hasGst" 
                                            className="text-xs font-bold text-[#052326]/80 dark:text-gray-300 cursor-pointer select-none disabled:opacity-50"
                                        >
                                            My business has a GST number (for business invoicing)
                                        </label>
                                    </div>

                                    {hasGst && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-300 ease-in-out">
                                            <div className="space-y-1.5">
                                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                    <ShieldCheck size={12} className="text-[#052326]/40" />
                                                    GST Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={gstNumber}
                                                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                                    disabled={!isEditing}
                                                    maxLength={15}
                                                    className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100 uppercase"
                                                    placeholder="22AAAAA0000A1Z5"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/60 dark:text-gray-400">
                                                    <Building2 size={12} className="text-[#052326]/40" />
                                                    Company Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={companyName}
                                                    onChange={(e) => setCompanyName(e.target.value)}
                                                    disabled={!isEditing}
                                                    className="w-full h-11 px-4 rounded-[10px] border-[0.5px] border-black/50 bg-[#052326]/[0.01] dark:bg-gray-800/40 text-sm font-medium focus:ring-1 focus:ring-[#052326] focus:border-[#052326] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50/50 text-[#052326] dark:text-gray-100"
                                                    placeholder="Registered Company Name"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t-[0.5px] border-black/10 dark:border-white/5">
                                {isEditing ? (
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setName(user?.name || '');
                                                setPhone(user?.phone || '');
                                                setDateOfBirth(user?.date_of_birth || '');
                                                setGender(user?.gender || '');
                                                setAddress(user?.address || '');
                                                setCity(user?.city || '');
                                                setState(user?.state || '');
                                                setCountry(user?.country || '');
                                                setPostalCode(user?.postal_code || '');
                                                setHasGst(!!user?.gst_number);
                                                setGstNumber(user?.gst_number || '');
                                                setCompanyName(user?.company_name || '');
                                                setPreviewUrl(user?.profile_image_url || null);
                                                setAvatarFile(null);
                                                setMessage(null);
                                            }}
                                            className="px-6 py-2.5 rounded-[10px] border-[0.5px] border-black/50 hover:bg-[#052326]/5 text-[#052326] dark:text-gray-200 text-xs font-bold transition-all"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2.5 rounded-[10px] bg-[#052326] text-white hover:bg-[#0b4435] transition-all flex items-center gap-2 disabled:opacity-50 text-xs font-bold shadow-sm"
                                        >
                                            {isLoading ? <Loader className="animate-spin" size={14} /> : <Save size={14} />}
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 rounded-[10px] bg-[#052326] text-white hover:bg-[#0b4435] transition-all text-xs font-bold shadow-sm"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
