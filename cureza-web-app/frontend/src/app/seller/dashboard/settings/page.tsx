'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import {
    Loader2, Shield, Bell, Landmark, User, Save, AlertCircle,
    CheckCircle2, Info, Upload, Eye, EyeOff, Building2, MapPin, Globe, Phone, Clock, FileText, X
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { indianLocations } from '@/data/indianLocations';

export default function SellerSettingsPage() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('security');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [previews, setPreviews] = useState<any>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/seller/settings');
            setSettings(res.data);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            showToast("Failed to load settings", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-cureza-green" size={32} />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-gray-900 font-medium">Failed to load settings. Please try reloading.</p>
                <button
                    onClick={fetchSettings}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-xl shadow-gray-200 hover:bg-black transition-all"
                >
                    Reload Settings
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Account Intelligence</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Coordinate your security, communication channels, and financial parameters.</p>
            </div>

            <div className="flex flex-col gap-6">
                {/* Top Compact Horizontal Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-gray-100">
                    <TabButton
                        active={activeTab === 'security'}
                        onClick={() => handleTabChange('security')}
                        icon={Shield}
                        label="Security"
                    />
                    <TabButton
                        active={activeTab === 'notifications'}
                        onClick={() => handleTabChange('notifications')}
                        icon={Bell}
                        label="Notifications"
                    />
                    <TabButton
                        active={activeTab === 'bank'}
                        onClick={() => handleTabChange('bank')}
                        icon={Landmark}
                        label="Bank & Payout"
                    />
                    <TabButton
                        active={activeTab === 'profile'}
                        onClick={() => handleTabChange('profile')}
                        icon={User}
                        label="Business Profile"
                    />
                    <TabButton
                        active={activeTab === 'kyc'}
                        onClick={() => handleTabChange('kyc')}
                        icon={FileText}
                        label="KYC & Documents"
                    />
                </div>

                {/* Content Area Underneath */}
                <div className="w-full min-w-0">
                    <div className="premium-card overflow-hidden">
                        {activeTab === 'security' && <SecurityTab settings={settings} />}
                        {activeTab === 'notifications' && <NotificationsTab settings={settings} refresh={fetchSettings} />}
                        {activeTab === 'bank' && <BankTab settings={settings} refresh={fetchSettings} />}
                        {activeTab === 'profile' && <ProfileTab settings={settings} refresh={fetchSettings} />}
                        {activeTab === 'kyc' && <KYCTab settings={settings} refresh={fetchSettings} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap border ${active
                ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200/50'
                : 'text-gray-500 bg-white border-gray-100 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <Icon size={16} className={active ? 'text-cureza-green' : 'text-gray-400'} />
            {label}
        </button>
    );
}

// --- UTILS ---

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest mb-1">{label}</span>
            <span className="text-sm font-extrabold text-gray-900">{value}</span>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function SecurityTab({ settings }: any) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await axios.post('/seller/settings/password', data);
            showToast("Password updated successfully", "success");
            reset();
        } catch (err: any) {
            showToast(err.response?.data?.message || "Password update failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-10 space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Account Security</h2>
                <p className="text-gray-500 text-sm font-medium">Manage your password and security settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                {...register('current_password', { required: "Required" })}
                                className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cureza-green/50 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-3 text-gray-400"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            {...register('password', { required: "Required", minLength: 8 })}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cureza-green/50 outline-none"
                        />
                        {errors.password && <p className="text-xs text-red-500">Min 8 characters required</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            {...register('password_confirmation', { required: "Required" })}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cureza-green/50 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-extrabold shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="text-cureza-green" />}
                        Commit Password Change
                    </button>
                </form>

                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-3 uppercase text-[10px] tracking-widest px-1">
                            <span className="p-1.5 bg-cureza-green/10 text-cureza-green rounded-lg">
                                <Info size={14} />
                            </span>
                            Verification Registry
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Access Role</span>
                                <span className="px-3 py-1 bg-white text-cureza-green text-[10px] font-extrabold rounded-lg shadow-sm border border-emerald-50 uppercase tracking-wider">{settings?.user?.role}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Protocol Status</span>
                                <span className="px-3 py-1 bg-white text-blue-600 text-[10px] font-extrabold rounded-lg shadow-sm border border-blue-50 uppercase tracking-wider">{settings?.account_info?.status}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Last Auth Login</span>
                                <span className="text-xs font-bold text-gray-700">{settings?.account_info?.last_login_at || 'NEVER'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Primary Contact</span>
                                <span className="text-xs font-bold text-gray-700">{settings?.user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NotificationsTab({ settings, refresh }: any) {
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [vals, setVals] = useState({
        order_notifications: true,
        payment_notifications: true,
        ticket_notifications: true,
        email_notifications: true,
        in_app_notifications: true,
        whatsapp_notifications: false,
        ...(settings?.notifications || {})
    });

    const toggle = async (key: string) => {
        const newVal = !vals[key];
        setVals({ ...vals, [key]: newVal });

        try {
            await axios.post('/seller/settings/notifications', { ...vals, [key]: newVal });
            showToast("Preference saved", "success");
        } catch (err) {
            showToast("Failed to save", "error");
            setVals(vals); // Rollback
        }
    };

    return (
        <div className="p-10 space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Notification Preferences</h2>
                <p className="text-gray-500 text-sm font-medium">Configure how you receive alerts and messages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] px-1">Alert Categories</h3>
                    <ToggleItem
                        label="New Orders"
                        sub="Receive alerts for every new order placed."
                        on={vals.order_notifications}
                        onChange={() => toggle('order_notifications')}
                    />
                    <ToggleItem
                        label="Payouts & Payments"
                        sub="Get notified when a payout is processed."
                        on={vals.payment_notifications}
                        onChange={() => toggle('payment_notifications')}
                    />
                    <ToggleItem
                        label="Support Tickets"
                        sub="Alerts for ticket replies from customers or admin."
                        on={vals.ticket_notifications}
                        onChange={() => toggle('ticket_notifications')}
                    />
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Channels</h3>
                    <ToggleItem
                        label="Email Notifications"
                        sub="Send summary alerts to your registered email."
                        on={vals.email_notifications}
                        onChange={() => toggle('email_notifications')}
                    />
                    <ToggleItem
                        label="In-App Notifications"
                        sub="Show red dot indicators in seller panel."
                        on={vals.in_app_notifications}
                        onChange={() => toggle('in_app_notifications')}
                    />
                    <ToggleItem
                        label="WhatsApp Notifications"
                        sub="Direct alerts on your phone (Future-ready)."
                        on={vals.whatsapp_notifications}
                        onChange={() => toggle('whatsapp_notifications')}
                    />
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ label, sub, on, onChange }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-cureza-green transition-all">
            <div className="space-y-1">
                <p className="font-extrabold text-gray-900 text-sm">{label}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{sub}</p>
            </div>
            <button
                onClick={onChange}
                className={`w-14 h-7 rounded-full transition-all relative border-2 ${on ? 'bg-gray-900 border-gray-900' : 'bg-gray-100 border-gray-200'}`}
            >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${on ? 'left-8' : 'left-0.5'}`} />
            </button>
        </div>
    );
}

function BankTab({ settings, refresh }: any) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            bank_name: settings?.profile?.bank_name || '',
            branch_name: settings?.profile?.branch_name || '',
            bank_account_number: settings?.profile?.bank_account_number || '',
            ifsc_code: settings?.profile?.ifsc_code || '',
            account_holder_name: settings?.profile?.account_holder_name || '',
            bic_swift_code: settings?.profile?.bic_swift_code || '',
            gst_number: settings?.profile?.gst_number || '',
            pan_number: settings?.profile?.pan_number || '',
        }
    });

    const pending = settings?.pending_requests?.bank?.[0];
    const profile = settings?.profile || {};

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await axios.post('/seller/settings/bank', data);
            showToast("Bank update request submitted", "success");
            refresh();
        } catch (err: any) {
            showToast(err.response?.data?.message || "Submit failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-10 space-y-10">
            <div className="border-b border-gray-50 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Bank Details</h2>
                    <p className="text-gray-500 text-sm font-medium">Manage where you receive your payouts.</p>
                </div>
                <div className="flex gap-2">
                    <span className={`text-[10px] px-4 py-1.5 rounded-xl font-extrabold uppercase tracking-widest border shadow-sm ${profile.bank_account_number ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                        {profile.bank_account_number ? 'Active Account' : 'Account Setup Incomplete'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Current Settings + Pending */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-6 px-1">Active Bank Info</h3>
                        <div className="space-y-6">
                            <InfoRow label="Account Holder" value={profile.account_holder_name || 'NOT_DEFINED'} />
                            <InfoRow label="Bank Name" value={profile.bank_name || 'NOT_DEFINED'} />
                            <InfoRow label="Account Number" value={profile.bank_account_number || 'HIDDEN'} />
                            <InfoRow label="IFSC Code" value={profile.ifsc_code || 'N/A'} />
                            <InfoRow label="PAN Number" value={profile.pan_number || 'NOT_LINKED'} />
                        </div>
                    </div>

                    {pending && (
                        <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                <Clock size={64} />
                            </div>
                            <h3 className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Update Pending Review
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(pending.new_data).map(([key, val]: any) => {
                                    if (pending.old_data?.[key] === val) return null;
                                    return (
                                        <div key={key} className="flex flex-col border-b border-amber-100/30 pb-2">
                                            <span className="text-[9px] text-amber-500 uppercase font-extrabold tracking-tighter italic">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-extrabold text-amber-900">{val}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-6 text-[10px] text-amber-700 font-bold uppercase tracking-widest border-t border-amber-100 pt-4 text-center">
                                Logged: {new Date(pending.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Update Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 ${pending ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Account Holder Name</label>
                                <input {...register('account_holder_name', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Name as in bank records" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Bank Name</label>
                                <input {...register('bank_name', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="e.g. HDFC Bank" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Branch Name</label>
                                <input {...register('branch_name')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Branch location" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Account Number</label>
                                <input {...register('bank_account_number', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Numbers only" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">IFSC Code</label>
                                <input {...register('ifsc_code', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="HDFC0001234" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">PAN Number</label>
                                <input {...register('pan_number')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="ABCDE1234F" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">GST Number (Optional)</label>
                                <input {...register('gst_number')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="29XXXXX..." />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !!pending}
                                className="bg-gray-900 text-white px-10 py-4 rounded-3xl font-extrabold text-xs uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-black hover:scale-[1.02] transition-all disabled:bg-gray-200 disabled:text-gray-400"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-3">
                                        <Loader2 className="animate-spin" size={18} /> Synchronizing...
                                    </span>
                                ) : 'Authorize Account Modification'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function ProfileTab({ settings, refresh }: any) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            brand_name: settings?.brand?.name || '',
            short_description: settings?.brand?.short_description || '',
            phone: settings?.user?.phone || '',
            address_line_1: settings?.profile?.address_line_1 || '',
            address_line_2: settings?.profile?.address_line_2 || '',
            city: settings?.profile?.city || '',
            state: settings?.profile?.state || '',
            country: settings?.profile?.country || 'India',
            pin_code: settings?.profile?.pin_code || '',
            business_type: settings?.profile?.registering_as || '',
            annual_turnover: settings?.profile?.annual_turnover || '',
            sourcing_method: settings?.profile?.sourcing_method || '',
            sell_on_other_platforms: settings?.profile?.sell_on_other_platforms ? 'Yes' : 'No',
            has_website: settings?.profile?.has_website ? 'Yes' : 'No',
            website_url: settings?.profile?.website_url || '',
        }
    });

    useEffect(() => {
        if (settings?.profile?.registering_as) {
            setSelectedBusinessTypes(
                settings.profile.registering_as.split(',').map((s: string) => s.trim())
            );
        }
    }, [settings]);

    const selectedState = watch('state');
    const defaultCity = settings?.profile?.city || '';

    const watchedBrandName = watch('brand_name');
    const watchedPhone = watch('phone');
    const watchedBusinessType = watch('business_type');
    const watchedAddressLine1 = watch('address_line_1');
    const watchedAddressLine2 = watch('address_line_2');
    const watchedCity = watch('city');
    const watchedState = watch('state');
    const watchedCountry = watch('country');
    const watchedPinCode = watch('pin_code');

    const handleBusinessTypeChange = (val: string, checked: boolean) => {
        let updated = [...selectedBusinessTypes];
        if (checked) {
            if (!updated.includes(val)) updated.push(val);
        } else {
            updated = updated.filter(item => item !== val);
        }
        setSelectedBusinessTypes(updated);
        setValue('business_type', updated.join(', '));
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        const payload = {
            ...data,
            business_type: selectedBusinessTypes.join(', ')
        };
        try {
            await axios.post('/seller/settings/profile', payload);
            showToast("Profile update submitted", "success");
            refresh();
        } catch (err: any) {
            showToast("Failed to submit", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const pending = settings?.pending_requests?.profile?.[0];
    const profile = settings?.profile || {};

    return (
        <div className="p-10 space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Business Details</h2>
                <p className="text-gray-500 text-sm font-medium">Coordinate your brand profile and contact information.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Overview */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-6 px-1">Profile Overview</h3>
                        <div className="space-y-6">
                            <InfoRow label="Brand Name" value={watchedBrandName || 'NOT_DEFINED'} />
                            <InfoRow label="Business Categories" value={watchedBusinessType || 'Standard'} />
                            <InfoRow label="Email" value={settings?.user?.email} />
                            <InfoRow label="Phone Number" value={watchedPhone || '9870000000'} />
                            <InfoRow label="Annual Turnover" value={watch('annual_turnover') || 'Not Selected'} />
                            <InfoRow label="Sourcing Method" value={watch('sourcing_method') || 'Not Selected'} />
                            <InfoRow label="Sells Elsewhere" value={watch('sell_on_other_platforms') || 'No'} />
                            <InfoRow label="Has Website" value={watch('has_website') || 'No'} />
                            {watch('has_website') === 'Yes' && watch('website_url') && (
                                <InfoRow label="Website Link" value={watch('website_url')} />
                            )}
                            <div className="pt-4 border-t border-gray-100">
                                <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest block mb-2">Registered Address</span>
                                <p className="text-sm font-extrabold text-gray-900 leading-relaxed">
                                    {watchedAddressLine1 || 'LOC_NOT_SET'}
                                    {watchedAddressLine2 ? `, ${watchedAddressLine2}` : ''} <br />
                                    {watchedCity || 'CITY_NOT_SET'}, {watchedState || 'STATE_NOT_SET'} <br />
                                    {watchedCountry || 'India'} - {watchedPinCode || '000000'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {pending && (
                        <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform text-blue-600">
                                <User size={120} />
                            </div>
                            <h3 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                Compliance Review
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(pending.new_data).map(([key, val]: any) => {
                                    if (pending.old_data?.[key] === val) return null;
                                    return (
                                        <div key={key} className="flex flex-col border-b border-blue-100/30 pb-2">
                                            <span className="text-[9px] text-blue-500 uppercase font-extrabold tracking-tighter italic">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-extrabold text-blue-900">
                                                {Array.isArray(val) ? val.join(', ') : String(val)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-6 text-[10px] text-blue-700 font-bold uppercase tracking-widest border-t border-blue-100 pt-4 text-center">
                                Pending Verification Protocol
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 ${pending ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Brand Name</label>
                                <input {...register('brand_name', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                                <input {...register('phone')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" />
                            </div>
                        </div>

                        {/* Enterprise Category with checkboxes */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Business Categories</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { value: 'Brand', label: 'Established Brand' },
                                    { value: 'Manufacturer', label: 'Primary Manufacturer' },
                                    { value: 'Wholesale', label: 'Wholesale Partner' },
                                    { value: 'Reseller', label: 'Authorized Reseller' }
                                ].map(opt => (
                                    <label key={opt.value} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-100/30 transition-all select-none">
                                        <input
                                            type="checkbox"
                                            value={opt.value}
                                            checked={selectedBusinessTypes.includes(opt.value)}
                                            onChange={(e) => handleBusinessTypeChange(opt.value, e.target.checked)}
                                            className="w-4 h-4 rounded text-cureza-green focus:ring-cureza-green cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-gray-900">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Business Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Annual Turnover *</label>
                                <select 
                                    {...register('annual_turnover', { required: true })} 
                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Range</option>
                                    {["Less than 1 Lakh", "1 Lakh - 10 Lakh", "10 Lakh - 50 Lakh", "50 Lakh - 1 Crore", "Over 1 Crore"].map(range => (
                                        <option key={range} value={range}>{range}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Sourcing Method *</label>
                                <select 
                                    {...register('sourcing_method', { required: true })} 
                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Method</option>
                                    {["I manufacture them", "I sell products manufactured for me", "I resell what I buy", "I import them"].map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Do you sell on other platforms? *</label>
                                <select 
                                    {...register('sell_on_other_platforms', { required: true })} 
                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Do you have a website? *</label>
                                <select 
                                    {...register('has_website', { required: true })} 
                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>

                        {watch('has_website') === 'Yes' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Website URL</label>
                                <input 
                                    type="url" 
                                    {...register('website_url')} 
                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" 
                                    placeholder="https://example.com" 
                                />
                            </div>
                        )}

                        <div className="space-y-6 border-t border-gray-100 pt-6">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] block px-1">Registered Address</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Address Line 1</label>
                                    <input {...register('address_line_1', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="House No, Street name, area..." />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Address Line 2 (Optional)</label>
                                    <input {...register('address_line_2')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Apartment, landmark, suite..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">State</label>
                                    <div className="relative">
                                        <select
                                            {...register('state', { 
                                                required: true,
                                                onChange: () => setValue('city', '')
                                            })} 
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {Object.keys(indianLocations).map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">City</label>
                                    <div className="relative">
                                        <select 
                                            {...register('city', { required: true })} 
                                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select City</option>
                                            {selectedState && indianLocations[selectedState] ? (
                                                indianLocations[selectedState].map(ct => (
                                                    <option key={ct} value={ct}>{ct}</option>
                                                ))
                                            ) : (
                                                defaultCity ? <option value={defaultCity}>{defaultCity}</option> : null
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Country</label>
                                    <input {...register('country')} readOnly className="w-full h-14 px-6 rounded-2xl bg-gray-100 border border-gray-100 text-sm font-bold outline-none text-gray-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Pincode</label>
                                    <input {...register('pin_code', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="6 digit pincode" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !!pending}
                                className="bg-gray-900 text-white px-10 py-4 rounded-3xl font-extrabold text-xs uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-black hover:scale-[1.02] transition-all disabled:bg-gray-200 disabled:text-gray-400"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-3">
                                        <Loader2 className="animate-spin" size={18} /> Processing...
                                    </span>
                                ) : 'Save Profile Details'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function KYCTab({ settings, refresh }: any) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyType, setCompanyType] = useState<string>(settings?.profile?.company_type || 'Sole Proprietorship');
    const [selectedLicenses, setSelectedLicenses] = useState<string[]>(settings?.profile?.selected_licenses || []);
    
    // For storing selected file objects locally before submitting
    const [files, setFiles] = useState<any>({});
    // Previews of selected files (local URLs or 'pdf')
    const [previews, setPreviews] = useState<any>({});
    
    // For storing/watching number fields
    const [kycNumbers, setKycNumbers] = useState<any>(settings?.profile?.kyc_numbers || {});

    const pending = settings?.pending_requests?.kyc?.[0];
    const profile = settings?.profile || {};

    useEffect(() => {
        if (settings?.profile?.company_type) {
            setCompanyType(settings.profile.company_type);
        }
        if (settings?.profile?.selected_licenses) {
            setSelectedLicenses(settings.profile.selected_licenses);
        }
        if (settings?.profile?.kyc_numbers) {
            setKycNumbers(settings.profile.kyc_numbers);
        }
    }, [settings]);

    const commonDocs = [
        { id: 'gst_cert', label: 'GST Certificate (If applicable)', required: false, hasNumber: true, placeholder: 'Enter GSTIN' },
        { id: 'udyam', label: 'Udyam Registration Certificate (Optional)', required: false, hasNumber: true, placeholder: 'Enter Udyam Number' },
        { id: 'startup_india', label: 'Startup India Certificate (Optional)', required: false, hasNumber: true, placeholder: 'Enter Startup ID' },
        { id: 'bank_proof', label: 'Bank Account Proof (Mandatory: Cancelled Cheque / Statement)', required: true },
        { id: 'address_proof', label: 'Address Proof (Optional: Electricity Bill / Rent / Property)', required: false },
    ];

    const getSpecificDocs = (compType: string) => {
        if (!compType) return [];
        if (compType === 'Sole Proprietorship') {
            return [
                { id: 'proprietor_pan', label: 'Proprietor PAN (Personal PAN - Mandatory)', required: true, hasNumber: true, placeholder: 'Enter PAN Number' },
                { id: 'proprietor_aadhaar', label: 'Aadhaar + Address Proof of Proprietor', required: true, hasNumber: true, placeholder: 'Enter Aadhaar Number' }
            ];
        } else if (compType === 'Partnership Firm') {
            return [
                { id: 'partnership_deed', label: 'Partnership Deed', required: true },
                { id: 'firm_pan', label: 'Firm PAN Card', required: true, hasNumber: true, placeholder: 'Enter Firm PAN' },
                { id: 'auth_letter', label: 'Authorization Letter', required: true },
                { id: 'signatory_pan', label: 'Authorized Signatory PAN', required: true, hasNumber: true, placeholder: 'Enter PAN' },
                { id: 'signatory_aadhaar', label: 'Authorized Signatory Aadhaar', required: true, hasNumber: true, placeholder: 'Enter Aadhaar' },
                { id: 'signatory_photo', label: 'Authorized Signatory Photograph', required: true },
                { id: 'signatory_signature', label: 'Authorized Signatory Signature', required: true }
            ];
        } else if (compType === 'Private Limited Company') {
            return [
                { id: 'coi', label: 'Certificate of Incorporation', required: true },
                { id: 'moa', label: 'MOA (Memorandum of Association)', required: true },
                { id: 'aoa', label: 'AOA (Articles of Association)', required: true },
                { id: 'company_pan', label: 'Company PAN Card (Mandatory)', required: true, hasNumber: true, placeholder: 'Enter Company PAN' },
                { id: 'director_pan', label: 'Director PAN', required: true, hasNumber: true, placeholder: 'Enter PAN' },
                { id: 'director_aadhaar', label: 'Director Aadhaar', required: true, hasNumber: true, placeholder: 'Enter Aadhaar' },
                { id: 'director_photo', label: 'Director Photograph', required: true },
                { id: 'director_signature', label: 'Director Signature', required: true }
            ];
        } else if (compType === 'LLP') {
            return [
                { id: 'llp_coi', label: 'LLP Certificate of Incorporation', required: true },
                { id: 'llp_agreement', label: 'LLP Agreement', required: true },
                { id: 'llp_pan', label: 'LLP PAN Card', required: true, hasNumber: true, placeholder: 'Enter LLP PAN' },
                { id: 'partner_pan_upload', label: 'Designated Partner PAN Upload', required: true },
                { id: 'partner_aadhaar_upload', label: 'Designated Partner Aadhaar Upload', required: true },
                { id: 'partner_signature', label: 'Designated Partner Signature', required: true },
                { id: 'auth_letter_llp', label: 'Authorization Letter', required: true }
            ];
        }
        return [];
    };

    const getImageUrl = (path: any) => {
        if (!path) return '';
        if (typeof path !== 'string') return '';
        if (path.startsWith('http')) return path;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backendUrl}${path}` : `${backendUrl}/storage/${path}`;
    };

    const getDocInfo = (docId: string) => {
        // Check if there is a pending request for this document
        const pendingKyc = settings?.pending_requests?.kyc?.[0];
        const pendingPath = pendingKyc?.new_data?.kyc_docs?.[docId] || pendingKyc?.new_data?.[docId];
        if (pendingPath) {
            return {
                status: 'pending',
                path: pendingPath,
            };
        }

        const dbPath = profile.kyc_docs?.[docId] || profile[`${docId}_image_path`] || profile[`${docId}_path`] || profile[docId];
        const dbStatus = dbPath ? (profile.kyc_document_statuses?.[docId] || profile[`${docId}_status`] || 'pending') : 'not_uploaded';
        
        return {
            status: dbStatus,
            path: dbPath,
        };
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formDataPayload = new FormData();

        formDataPayload.append('company_type', companyType);
        selectedLicenses.forEach((license, idx) => {
            formDataPayload.append(`selected_licenses[${idx}]`, license);
        });

        // Add kyc numbers
        Object.entries(kycNumbers).forEach(([k, v]: any) => {
            if (v !== undefined && v !== null && v !== '') {
                formDataPayload.append(`kyc_numbers[${k}]`, v);
            }
        });

        // Add files
        Object.entries(files).forEach(([k, v]: any) => {
            if (v) {
                formDataPayload.append(`kyc_docs[${k}]`, v);
            }
        });

        try {
            await axios.post('/seller/settings/kyc', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast("KYC documents submitted for review", "success");
            setPreviews({});
            setFiles({});
            refresh();
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to upload KYC", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDocCard = (doc: any) => {
        const { status, path } = getDocInfo(doc.id);
        const isSelectedNewFile = !!previews[doc.id];
        
        let previewUrl = previews[doc.id] || getImageUrl(path);
        const isPdf = previewUrl === 'pdf' || previewUrl.toLowerCase().endsWith('.pdf') || (typeof previews[doc.id] === 'string' && previews[doc.id] === 'pdf');

        return (
            <div key={doc.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[350px] group transition-all hover:shadow-md">
                <div>
                    <div className="flex justify-between items-start gap-2 mb-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider leading-none mt-1 truncate" title={doc.label}>
                                {doc.label} {doc.required && <span className="text-red-500">*</span>}
                            </p>
                            <p className="text-[8px] text-gray-400 font-mono mt-1 uppercase">ID: {doc.id}</p>
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded-lg font-extrabold uppercase tracking-wider border shrink-0 ${
                            status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                            {status === 'not_uploaded' ? 'Not Uploaded' : status === 'pending' ? 'Under Review' : status}
                        </span>
                    </div>

                    {/* Preview Block */}
                    <div className="aspect-[4/3] bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100/50 relative mb-4">
                        {previewUrl ? (
                            isPdf ? (
                                <div className="flex flex-col items-center p-4">
                                    <div className="p-2.5 bg-rose-50 rounded-xl mb-2">
                                        <FileText size={24} className="text-rose-500" />
                                    </div>
                                    <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">PDF Document</span>
                                    {previewUrl !== 'pdf' && (
                                        <a 
                                            href={previewUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2"
                                        >
                                            <Eye size={16} /> View PDF
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <img src={previewUrl} alt={doc.label} className="w-full h-full object-cover" />
                                    <a 
                                        href={previewUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2"
                                    >
                                        <Eye size={16} /> View Image
                                    </a>
                                </>
                            )
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <Upload size={20} className="text-gray-300 mb-2" />
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">Not Uploaded</span>
                            </div>
                        )}
                    </div>

                    {/* Number Input if applicable */}
                    {doc.hasNumber && (
                        <div className="space-y-1 mb-4">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Document Number</label>
                            <input
                                type="text"
                                placeholder={doc.placeholder || 'Enter Document ID'}
                                value={kycNumbers[doc.id] || ''}
                                disabled={status === 'approved' || !!pending}
                                onChange={(e) => {
                                    setKycNumbers((prev: any) => ({
                                        ...prev,
                                        [doc.id]: e.target.value
                                    }));
                                }}
                                className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-bold focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green outline-none transition-all uppercase placeholder:normal-case disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            />
                        </div>
                    )}
                </div>

                {/* Upload Action Footer */}
                <div>
                    {isSelectedNewFile ? (
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl text-xs font-extrabold text-emerald-800">
                            <span className="truncate flex-1 pr-2 text-[10px]">New File Selected</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviews((prev: any) => {
                                        const copy = { ...prev };
                                        delete copy[doc.id];
                                        return copy;
                                    });
                                    setFiles((prev: any) => {
                                        const copy = { ...prev };
                                        delete copy[doc.id];
                                        return copy;
                                    });
                                }}
                                className="text-rose-500 hover:text-rose-700 shrink-0"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        status !== 'pending' && !pending ? (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    id={`file-${doc.id}`}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 2 * 1024 * 1024) {
                                                showToast('File size must be less than 2MB', 'error');
                                                e.target.value = '';
                                                return;
                                            }
                                            if (file.type === 'application/pdf') {
                                                setPreviews((prev: any) => ({ ...prev, [doc.id]: 'pdf' }));
                                            } else {
                                                setPreviews((prev: any) => ({ ...prev, [doc.id]: URL.createObjectURL(file) }));
                                            }
                                            setFiles((prev: any) => ({ ...prev, [doc.id]: file }));
                                        }
                                    }}
                                />
                                <label
                                    htmlFor={`file-${doc.id}`}
                                    className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-[10px] font-extrabold transition-all border border-gray-200 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Upload size={12} />
                                    {status === 'not_uploaded' ? 'Upload File' : 'Reupload / Change'}
                                </label>
                            </div>
                        ) : (
                            <div className="w-full py-2 bg-amber-50/40 text-amber-800 border border-amber-100/50 rounded-xl text-[10px] font-extrabold text-center">
                                Under Review
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    };

    const hasChanges = Object.keys(files).length > 0 || 
                       JSON.stringify(kycNumbers) !== JSON.stringify(settings?.profile?.kyc_numbers || {}) ||
                       companyType !== (settings?.profile?.company_type || 'Sole Proprietorship') ||
                       JSON.stringify(selectedLicenses) !== JSON.stringify(settings?.profile?.selected_licenses || []);

    const activeLicenses = selectedLicenses.filter(l => l !== 'Upload Later').map(l => ({
        id: `license_${l.toLowerCase().replace(/ /g, '_').replace(/\//g, '')}`,
        label: `${l} License`,
        required: true,
        hasNumber: true,
        placeholder: `Enter ${l} Number`
    }));

    return (
        <div className="p-10 space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">KYC Documents</h2>
                <p className="text-gray-500 text-sm font-medium">Upload verified documents required for compliance approval.</p>
            </div>

            {pending && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8 flex gap-6 items-start animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-100/20">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-amber-900 font-extrabold text-lg tracking-tight mb-2">Compliance Review in Progress</h3>
                        <p className="text-amber-800/80 font-medium leading-relaxed text-sm">
                            A verification request was initiated on <strong>{new Date(pending.created_at).toLocaleDateString()}</strong>.
                            You cannot make new updates until this review is completed by the superadmin.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-10">
                
                {/* Product / Regulatory Licenses selection */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-widest">Product / Regulatory Licenses *</h4>
                            <p className="text-[10px] text-gray-500 font-medium">Select available licenses or choose "Upload Later"</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {['Drug License', 'AYUSH License', 'FSSAI License', 'CBD / Hemp NOC', 'COA / Lab Reports'].map(license => {
                            const isChecked = selectedLicenses.includes(license);
                            return (
                                <label key={license} className={`flex items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer transition-all select-none group ${isChecked ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-100 hover:border-emerald-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={!!pending}
                                        onChange={() => {
                                            let newSelected: string[];
                                            if (isChecked) {
                                                newSelected = selectedLicenses.filter(l => l !== license);
                                            } else {
                                                newSelected = [...selectedLicenses.filter(l => l !== 'Upload Later'), license];
                                            }
                                            setSelectedLicenses(newSelected);
                                        }}
                                        className="w-4 h-4 rounded border-gray-200 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className={`text-[11px] font-bold transition-colors ${isChecked ? 'text-emerald-900' : 'text-gray-700 group-hover:text-emerald-900'}`}>{license}</span>
                                </label>
                            );
                        })}
                        <label className={`flex items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer transition-all select-none group ${selectedLicenses.includes('Upload Later') ? 'border-amber-500 bg-amber-50/10' : 'border-gray-100 hover:border-amber-300'}`}>
                            <input
                                type="checkbox"
                                checked={selectedLicenses.includes('Upload Later')}
                                disabled={!!pending}
                                onChange={() => {
                                    const newSelected = selectedLicenses.includes('Upload Later') ? [] : ['Upload Later'];
                                    setSelectedLicenses(newSelected);
                                }}
                                className="w-4 h-4 rounded border-gray-200 text-amber-600 focus:ring-amber-500"
                            />
                            <span className={`text-[11px] font-bold transition-colors ${selectedLicenses.includes('Upload Later') ? 'text-amber-900' : 'text-gray-700 group-hover:text-amber-900'}`}>Upload Later</span>
                        </label>
                    </div>
                </div>

                {/* Common Documents Grid */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Common Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {commonDocs.map(renderDocCard)}
                        {activeLicenses.map(renderDocCard)}
                    </div>
                </div>

                {/* Specific Documents Constitution type selection */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 italic font-black">
                            ?
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Documents – Company Specific</h3>
                            <p className="text-xs text-gray-500 font-medium">Choose your legal entity status to unveil required documents</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Sole Proprietorship', 'Partnership Firm', 'Private Limited Company', 'LLP'].map(type => (
                            <button
                                key={type}
                                type="button"
                                disabled={!!pending}
                                onClick={() => setCompanyType(type)}
                                className={`px-2 py-4 rounded-2xl text-[10px] font-black border transition-all uppercase tracking-[0.1em] text-center flex items-center justify-center h-full min-h-[60px] ${companyType === type
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-200 scale-[1.02]'
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Constitution type documents Grid */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">{companyType} Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getSpecificDocs(companyType).map(renderDocCard)}
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || !!pending || !hasChanges}
                        className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-gray-200/50 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-3"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <CheckCircle2 size={16} className="text-cureza-green" />
                        )}
                        Submit KYC Documents
                    </button>
                </div>
            </form>
        </div>
    );
}
