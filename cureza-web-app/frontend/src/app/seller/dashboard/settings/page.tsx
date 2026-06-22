'use client';

import { useState, useEffect, useRef } from 'react';
import axios from '@/lib/api';
import { useForm } from 'react-hook-form';
import { useToast } from '@/contexts/ToastContext';
import {
    Loader2, Shield, Bell, Landmark, User, Save, AlertCircle,
    CheckCircle2, Info, Upload, Eye, EyeOff, Building2, MapPin, Globe, Phone, Clock, FileText, X, CreditCard, Check
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
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab) {
                setActiveTab(tab);
            }
        }
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
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all"
                >
                    Reload Settings
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Account Intelligence</h1>
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
                    <TabButton
                        active={activeTab === 'tax'}
                        onClick={() => handleTabChange('tax')}
                        icon={Landmark}
                        label="Tax Settings"
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
                        {activeTab === 'tax' && <TaxTab settings={settings} refresh={fetchSettings} />}
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${active
                ? 'bg-emerald-600 text-white border-emerald-650 shadow-sm'
                : 'text-gray-550 bg-white border-gray-150 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <Icon size={14} className={active ? 'text-white' : 'text-gray-400'} />
            {label}
        </button>
    );
}

// --- UTILS ---

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <span className="text-[11px] text-gray-500 capitalize font-semibold mb-1">{label}</span>
            <span className="text-sm font-semibold text-gray-800">{value}</span>
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
        <div className="p-4 sm:p-10 space-y-6 sm:space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Account Security</h2>
                <p className="text-gray-500 text-sm font-medium">Manage your password and security settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
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
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            {...register('password', { required: "Required", minLength: 8 })}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cureza-green/50 outline-none"
                        />
                        {errors.password && <p className="text-xs text-red-500">Min 8 characters required</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            {...register('password_confirmation', { required: "Required" })}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cureza-green/50 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="text-white" />}
                        Commit Password Change
                    </button>
                </form>

                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100">
                        <h3 className="font-semibold text-gray-850 mb-6 flex items-center gap-3 capitalize text-xs tracking-wider px-1">
                            <span className="p-1.5 bg-cureza-green/10 text-cureza-green rounded-lg">
                                <Info size={14} />
                            </span>
                            Verification Registry
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-xs font-semibold text-gray-500 capitalize tracking-normal">Access Role</span>
                                <span className="px-2.5 py-0.5 bg-white text-emerald-600 text-[10px] font-semibold rounded-lg shadow-sm border border-emerald-50 capitalize tracking-normal">{settings?.user?.role}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-xs font-semibold text-gray-500 capitalize tracking-normal">Protocol Status</span>
                                <span className="px-2.5 py-0.5 bg-white text-blue-600 text-[10px] font-semibold rounded-lg shadow-sm border border-blue-50 capitalize tracking-normal">{settings?.account_info?.status}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-xs font-semibold text-gray-500 capitalize tracking-normal">Last Auth Login</span>
                                <span className="text-xs font-semibold text-gray-700">{settings?.account_info?.last_login_at || 'NEVER'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-gray-500 capitalize tracking-normal">Primary Contact</span>
                                <span className="text-xs font-semibold text-gray-700">{settings?.user?.email}</span>
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
        <div className="p-4 sm:p-10 space-y-6 sm:space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Notification Preferences</h2>
                <p className="text-gray-500 text-sm font-medium">Configure how you receive alerts and messages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-xs font-semibold text-gray-500 capitalize px-1">Alert Categories</h3>
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
                    <h3 className="text-xs font-semibold text-gray-500 capitalize">Channels</h3>
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
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gray-50/50 rounded-xl border border-gray-100 group hover:border-cureza-green transition-all">
            <div className="space-y-1">
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-[10px] text-gray-500 font-medium tracking-tight normal-case">{sub}</p>
            </div>
            <button
                onClick={onChange}
                className={`w-14 h-7 rounded-full transition-all relative border-2 ${on ? 'bg-emerald-600 border-emerald-600' : 'bg-gray-100 border-gray-200'}`}
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
        <div className="p-4 sm:p-10 space-y-6 sm:space-y-10">
            <div className="border-b border-gray-50 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Bank Details</h2>
                    <p className="text-gray-500 text-sm font-medium">Manage where you receive your payouts.</p>
                </div>
                <div className="flex gap-2">
                    <span className={`text-xs px-3 py-1 rounded-xl font-semibold capitalize border shadow-sm ${profile.bank_account_number ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                        {profile.bank_account_number ? 'Active Account' : 'Account Setup Incomplete'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Current Settings + Pending */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-semibold text-gray-500 capitalize mb-6 px-1">Active Bank Info</h3>
                        <div className="space-y-6">
                            <InfoRow label="Account Holder" value={profile.account_holder_name || 'NOT_DEFINED'} />
                            <InfoRow label="Bank Name" value={profile.bank_name || 'NOT_DEFINED'} />
                            <InfoRow label="Account Number" value={profile.bank_account_number || 'HIDDEN'} />
                            <InfoRow label="IFSC Code" value={profile.ifsc_code || 'N/A'} />
                            <InfoRow label="PAN Number" value={profile.pan_number || 'NOT_LINKED'} />
                        </div>
                    </div>

                    {pending && (
                        <div className="bg-amber-50/50 border border-amber-100 p-4 sm:p-6 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                <Clock size={64} />
                            </div>
                            <h3 className="text-xs font-semibold text-amber-700 capitalize mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Update Pending Review
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(pending.new_data).map(([key, val]: any) => {
                                    if (pending.old_data?.[key] === val) return null;
                                    return (
                                        <div key={key} className="flex flex-col border-b border-amber-100/30 pb-2">
                                            <span className="text-[10px] text-amber-600 capitalize font-semibold tracking-normal">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-semibold text-amber-900">{val}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-6 text-[10px] text-amber-700 font-semibold capitalize border-t border-amber-100 pt-4 text-center">
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
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Account Holder Name</label>
                                <input {...register('account_holder_name', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Name as in bank records" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Bank Name</label>
                                <input {...register('bank_name', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="e.g. HDFC Bank" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Branch Name</label>
                                <input {...register('branch_name')} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Branch location" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Account Number</label>
                                <input {...register('bank_account_number', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Numbers only" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">IFSC Code</label>
                                <input {...register('ifsc_code', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="HDFC0001234" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">PAN Number</label>
                                <input {...register('pan_number')} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="ABCDE1234F" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">GST Number (Optional)</label>
                                <input {...register('gst_number')} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="29XXXXX..." />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !!pending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm capitalize shadow-md hover:scale-[1.02] transition-all disabled:bg-gray-200 disabled:text-gray-400"
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
            pickup_address_line_1: settings?.profile?.pickup_address_line_1 || '',
            pickup_address_line_2: settings?.profile?.pickup_address_line_2 || '',
            pickup_address_city: settings?.profile?.pickup_address_city || '',
            pickup_address_state: settings?.profile?.pickup_address_state || '',
            pickup_address_country: settings?.profile?.pickup_address_country || 'India',
            pickup_address_pin_code: settings?.profile?.pickup_address_pin_code || '',
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

    const selectedPickupState = watch('pickup_address_state');
    const defaultPickupCity = settings?.profile?.pickup_address_city || '';

    const watchedBrandName = watch('brand_name');
    const watchedPhone = watch('phone');
    const watchedBusinessType = watch('business_type');
    const watchedAddressLine1 = watch('address_line_1');
    const watchedAddressLine2 = watch('address_line_2');
    const watchedCity = watch('city');
    const watchedState = watch('state');
    const watchedCountry = watch('country');
    const watchedPinCode = watch('pin_code');

    const watchedPickupAddressLine1 = watch('pickup_address_line_1');
    const watchedPickupAddressLine2 = watch('pickup_address_line_2');
    const watchedPickupCity = watch('pickup_address_city');
    const watchedPickupState = watch('pickup_address_state');
    const watchedPickupCountry = watch('pickup_address_country');
    const watchedPickupPinCode = watch('pickup_address_pin_code');

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
        <div className="p-4 sm:p-10 space-y-6 sm:space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Business Details</h2>
                <p className="text-gray-500 text-sm font-medium">Coordinate your brand profile and contact information.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Overview */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-semibold text-gray-500 capitalize mb-6 px-1">Profile Overview</h3>
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
                                <span className="text-xs text-gray-500 capitalize font-semibold block mb-2">Registered Address</span>
                                <p className="text-sm font-semibold text-gray-800 leading-relaxed mb-4">
                                    {watchedAddressLine1 || 'LOC_NOT_SET'}
                                    {watchedAddressLine2 ? `, ${watchedAddressLine2}` : ''} <br />
                                    {watchedCity || 'CITY_NOT_SET'}, {watchedState || 'STATE_NOT_SET'} <br />
                                    {watchedCountry || 'India'} - {watchedPinCode || '000000'}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-500 capitalize font-semibold block mb-2">Default Pickup Point</span>
                                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                    {watchedPickupAddressLine1 || 'PICKUP_LOC_NOT_SET'}
                                    {watchedPickupAddressLine2 ? `, ${watchedPickupAddressLine2}` : ''} <br />
                                    {watchedPickupCity || 'CITY_NOT_SET'}, {watchedPickupState || 'STATE_NOT_SET'} <br />
                                    {watchedPickupCountry || 'India'} - {watchedPickupPinCode || '000000'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {pending && (
                        <div className="bg-blue-50/50 border border-blue-100 p-4 sm:p-6 rounded-xl relative overflow-hidden group">
                            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform text-blue-600">
                                <User size={120} />
                            </div>
                            <h3 className="text-xs font-semibold text-blue-700 capitalize mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                Compliance Review
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(pending.new_data).map(([key, val]: any) => {
                                    if (pending.old_data?.[key] === val) return null;
                                    return (
                                        <div key={key} className="flex flex-col border-b border-blue-100/30 pb-2">
                                            <span className="text-[10px] text-blue-600 capitalize font-semibold tracking-normal">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-semibold text-blue-900">
                                                {Array.isArray(val) ? val.join(', ') : String(val)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-6 text-[10px] text-blue-700 font-semibold capitalize border-t border-blue-100 pt-4 text-center">
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
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Brand Name</label>
                                <input {...register('brand_name', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Phone Number</label>
                                <input {...register('phone')} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" />
                            </div>
                        </div>

                        {/* Enterprise Category with buttons */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 capitalize px-1">Business Categories</label>
                            <div className="flex flex-wrap gap-1.5">
                                {['Brand', 'Manufacturer', 'Wholesale', 'Reseller'].map(type => {
                                    const isSelected = selectedBusinessTypes.includes(type);
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            disabled={!!pending}
                                            onClick={() => handleBusinessTypeChange(type, !isSelected)}
                                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Business Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Annual Turnover *</label>
                                <select 
                                    {...register('annual_turnover', { required: true })} 
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Range</option>
                                    {["Less than 1 Lakh", "1 Lakh - 10 Lakh", "10 Lakh - 50 Lakh", "50 Lakh - 1 Crore", "Over 1 Crore"].map(range => (
                                        <option key={range} value={range}>{range}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Sourcing Method *</label>
                                <select 
                                    {...register('sourcing_method', { required: true })} 
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
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
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Do you sell on other platforms? *</label>
                                <select 
                                    {...register('sell_on_other_platforms', { required: true })} 
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Do you have a website? *</label>
                                <select 
                                    {...register('has_website', { required: true })} 
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                >
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>

                        {watch('has_website') === 'Yes' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-semibold text-gray-500 capitalize px-1">Website URL</label>
                                <input 
                                    type="url" 
                                    {...register('website_url')} 
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" 
                                    placeholder="https://example.com" 
                                />
                            </div>
                        )}

                        <div className="space-y-6 border-t border-gray-100 pt-6">
                            <label className="text-xs font-semibold text-gray-500 capitalize block px-1">Registered Address</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Address Line 1</label>
                                    <input {...register('address_line_1', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="House No, Street name, area..." />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Address Line 2 (Optional)</label>
                                    <input {...register('address_line_2')} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Apartment, landmark, suite..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">State</label>
                                    <div className="relative">
                                        <select
                                            {...register('state', { 
                                                 required: true,
                                                 onChange: () => setValue('city', '')
                                            })} 
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {Object.keys(indianLocations).map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">City</label>
                                    <div className="relative">
                                        <select 
                                            {...register('city', { required: true })} 
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
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
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Country</label>
                                    <input {...register('country')} readOnly className="w-full h-11 px-4 rounded-xl bg-gray-100 border border-gray-100 text-sm font-semibold outline-none text-gray-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Pincode</label>
                                    <input {...register('pin_code', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="6 digit pincode" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 border-t border-gray-100 pt-6">
                            <label className="text-xs font-semibold text-gray-500 capitalize block px-1 font-bold text-gray-700">Default Pickup Point (India Only)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Pickup Address Line 1</label>
                                    <input {...register('pickup_address_line_1', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="House/Shop No, Building, Street..." />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Pickup Address Line 2 (Optional)</label>
                                    <input {...register('pickup_address_line_2')} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Apartment, Landlord, Locality..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Pickup State</label>
                                    <div className="relative">
                                        <select
                                            {...register('pickup_address_state', { 
                                                 required: true,
                                                 onChange: () => setValue('pickup_address_city', '')
                                             })} 
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select State</option>
                                            {Object.keys(indianLocations).map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Pickup City</label>
                                    <div className="relative">
                                        <select 
                                            {...register('pickup_address_city', { required: true })} 
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select City</option>
                                            {selectedPickupState && indianLocations[selectedPickupState] ? (
                                                indianLocations[selectedPickupState].map(ct => (
                                                    <option key={ct} value={ct}>{ct}</option>
                                                ))
                                            ) : (
                                                defaultPickupCity ? <option value={defaultPickupCity}>{defaultPickupCity}</option> : null
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Pickup Country</label>
                                    <input {...register('pickup_address_country')} readOnly className="w-full h-11 px-4 rounded-xl bg-gray-100 border border-gray-100 text-sm font-semibold outline-none text-gray-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 capitalize px-1">Pickup Pincode</label>
                                    <input {...register('pickup_address_pin_code', { required: true })} className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="6 digit pincode" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !!pending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm capitalize shadow-md hover:scale-[1.02] transition-all disabled:bg-gray-200 disabled:text-gray-400"
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
        if (settings?.profile) {
            const dbLicenses = settings.profile.selected_licenses || [];
            const normalized = dbLicenses.map((l: string) => {
                if (l === 'AYUSH') return 'AYUSH License';
                if (l === 'FSSAI') return 'FSSAI License';
                if (l === 'Drug') return 'Drug License';
                return l;
            });

            // Auto-detect any licenses that already have uploaded documents or numbers
            const kycDocs = settings.profile.kyc_docs || {};
            const kycNums = settings.profile.kyc_numbers || {};
            const docKeys = new Set([...Object.keys(kycDocs), ...Object.keys(kycNums)]);
            
            docKeys.forEach(k => {
                if (k.startsWith('license_')) {
                    let licenseName = '';
                    if (k === 'license_ayush_license' || k === 'license_ayush') licenseName = 'AYUSH License';
                    else if (k === 'license_fssai_license' || k === 'license_fssai') licenseName = 'FSSAI License';
                    else if (k === 'license_drug_license' || k === 'license_drug') licenseName = 'Drug License';
                    else if (k === 'license_cbd__hemp_noc') licenseName = 'CBD / Hemp NOC';
                    else if (k === 'license_coa__lab_reports') licenseName = 'COA / Lab Reports';
                    
                    if (licenseName && !normalized.includes(licenseName)) {
                        normalized.push(licenseName);
                    }
                }
            });

            setSelectedLicenses(normalized);
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

    const getLegacyKey = (key: string) => {
        if (key === 'license_ayush_license') return 'license_ayush';
        if (key === 'license_fssai_license') return 'license_fssai';
        if (key === 'license_drug_license') return 'license_drug';
        return null;
    };

    const getDocInfo = (docId: string) => {
        const legacyId = getLegacyKey(docId);
        // Check if there is a pending request for this document
        const pendingKyc = settings?.pending_requests?.kyc?.[0];
        let pendingPath = pendingKyc?.new_data?.kyc_docs?.[docId] || pendingKyc?.new_data?.[docId];
        if (!pendingPath && legacyId) {
            pendingPath = pendingKyc?.new_data?.kyc_docs?.[legacyId] || pendingKyc?.new_data?.[legacyId];
        }
        if (pendingPath) {
            return {
                status: 'pending',
                path: pendingPath,
            };
        }

        let dbPath = profile.kyc_docs?.[docId] || profile[`${docId}_image_path`] || profile[`${docId}_path`] || profile[docId];
        if (!dbPath && legacyId) {
            dbPath = profile.kyc_docs?.[legacyId] || profile[`${legacyId}_image_path`] || profile[`${legacyId}_path`] || profile[legacyId];
        }
        
        let dbStatus = 'not_uploaded';
        if (dbPath) {
            dbStatus = profile.kyc_document_statuses?.[docId] || profile[`${docId}_status`] || 'pending';
            if (legacyId && (!profile.kyc_document_statuses?.[docId] && !profile[`${docId}_status`])) {
                dbStatus = profile.kyc_document_statuses?.[legacyId] || profile[`${legacyId}_status`] || dbStatus;
            }
        }
        
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

    const renderDocRow = (doc: any) => {
        const { status, path } = getDocInfo(doc.id);
        const isSelectedNewFile = !!previews[doc.id];
        
        let previewUrl = previews[doc.id] || getImageUrl(path);
        const isPdf = previewUrl === 'pdf' || previewUrl.toLowerCase().endsWith('.pdf') || (typeof previews[doc.id] === 'string' && previews[doc.id] === 'pdf');

        // Choose icon based on document type
        let DocIcon = FileText;
        if (doc.id.includes('pan')) DocIcon = CreditCard;
        else if (doc.id.includes('gst')) DocIcon = Building2;
        else if (doc.id.includes('bank') || doc.id.includes('cheque') || doc.id.includes('proof')) DocIcon = Landmark;
        else if (doc.id.includes('signature')) DocIcon = CheckCircle2;

        return (
            <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 hover:bg-gray-50/40 px-2 rounded-xl transition-all duration-200">
                
                {/* Left Section: Icon, Label, and Status Badge */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                        status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-50 text-gray-400'
                    }`}>
                        <DocIcon size={16} />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 truncate">{doc.label}</span>
                            {doc.required && (
                                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                                    Required
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-extrabold uppercase tracking-wider ${
                                status === 'approved' ? 'text-emerald-600' :
                                status === 'rejected' ? 'text-rose-600' :
                                status === 'pending' ? 'text-amber-600' :
                                'text-gray-400'
                            }`}>
                                {status === 'not_uploaded' ? 'Not Uploaded' : status === 'pending' ? 'Under Review' : status}
                            </span>
                            {previewUrl && (
                                <a 
                                    href={previewUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-[9px] text-emerald-600 hover:underline flex items-center gap-0.5 font-bold"
                                >
                                    <Eye size={10} /> View
                                </a>
                            )}
                        </div>
                        {status === 'rejected' && (settings?.profile?.kyc_document_reasons?.[doc.id] || (getLegacyKey(doc.id) && settings?.profile?.kyc_document_reasons?.[getLegacyKey(doc.id)!])) && (
                            <p className="text-[9px] text-red-500 font-medium bg-red-50/50 border border-red-100/50 rounded p-1.5 mt-0.5 max-w-md">
                                {settings.profile.kyc_document_reasons[doc.id] || settings.profile.kyc_document_reasons[getLegacyKey(doc.id)!]}
                            </p>
                        )}
                    </div>
                </div>

                {/* Middle Section: Document Number Input */}
                {doc.hasNumber ? (
                    <div className="w-full md:w-44 shrink-0">
                        <input
                            type="text"
                            placeholder={doc.placeholder || 'Enter ID'}
                            value={kycNumbers[doc.id] || (getLegacyKey(doc.id) ? kycNumbers[getLegacyKey(doc.id)!] : '') || ''}
                            disabled={status === 'approved' || !!pending}
                            onChange={(e) => {
                                setKycNumbers((prev: any) => {
                                    const next = {
                                        ...prev,
                                        [doc.id]: e.target.value
                                    };
                                    const legacyId = getLegacyKey(doc.id);
                                    if (legacyId) {
                                        next[legacyId] = e.target.value;
                                    }
                                    return next;
                                });
                            }}
                            className="w-full h-8 px-3 rounded-lg border border-gray-200 bg-gray-50/30 text-xs font-bold focus:ring-2 focus:ring-cureza-green/10 focus:border-cureza-green outline-none transition-all uppercase placeholder:normal-case disabled:bg-gray-100/50 disabled:text-gray-400"
                        />
                    </div>
                ) : (
                    <div className="hidden md:block w-44 shrink-0"></div>
                )}

                {/* Right Section: Upload Action */}
                <div className="w-full md:w-36 shrink-0 flex items-center justify-end">
                    {isSelectedNewFile ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 w-full">
                            <span className="truncate flex-1 pr-2 text-[9px]">Ready</span>
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
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        status !== 'pending' && !pending ? (
                            <div className="w-full">
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
                                    className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-[9px] font-extrabold transition-all border border-gray-200 cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <Upload size={10} />
                                    {status === 'not_uploaded' ? 'Upload' : 'Replace'}
                                </label>
                            </div>
                        ) : (
                            <div className="w-full py-1.5 bg-amber-50/40 text-amber-800 border border-amber-100/50 rounded-lg text-[9px] font-extrabold text-center">
                                Under Review
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    };

    const dbLicensesNormalized = (settings?.profile?.selected_licenses || []).map((l: string) => {
        if (l === 'AYUSH') return 'AYUSH License';
        if (l === 'FSSAI') return 'FSSAI License';
        if (l === 'Drug') return 'Drug License';
        return l;
    });

    const activeLicenses = selectedLicenses.filter(l => l !== 'Upload Later').map(l => {
        const cleanName = l.replace(/\s*license\s*$/i, '').trim();
        let sanitizedIdPart = l.toLowerCase().replace(/ /g, '_').replace(/\//g, '');
        if (!sanitizedIdPart.endsWith('_license') && (sanitizedIdPart === 'ayush' || sanitizedIdPart === 'fssai' || sanitizedIdPart === 'drug')) {
            sanitizedIdPart = `${sanitizedIdPart}_license`;
        }
        const id = `license_${sanitizedIdPart}`;
        return {
            id,
            label: `${cleanName} License`,
            required: true,
            hasNumber: true,
            placeholder: `Enter ${cleanName} Number`
        };
    });

    const allDocs = [
        ...commonDocs,
        ...activeLicenses,
        ...getSpecificDocs(companyType)
    ];

    const hasChanges = Object.keys(files).length > 0 || 
                       allDocs.some(d => {
                           const currentVal = kycNumbers[d.id] || (getLegacyKey(d.id) ? kycNumbers[getLegacyKey(d.id)!] : '');
                           const originalVal = settings?.profile?.kyc_numbers?.[d.id] || (getLegacyKey(d.id) ? settings?.profile?.kyc_numbers?.[getLegacyKey(d.id)!] : '');
                           return (currentVal || '') !== (originalVal || '');
                       }) ||
                       companyType !== (settings?.profile?.company_type || 'Sole Proprietorship') ||
                       JSON.stringify(selectedLicenses) !== JSON.stringify(dbLicensesNormalized);

    const mandatoryDocs = allDocs.filter(d => d.required);
    const optionalDocs = allDocs.filter(d => !d.required);

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-gray-50 pb-4">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">KYC Documents</h2>
                <p className="text-gray-500 text-xs font-medium">Upload verified documents required for compliance approval.</p>
            </div>

            {pending && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 flex gap-4 items-start animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-100/20">
                    <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="text-amber-900 font-bold text-base tracking-tight mb-1">Compliance Review in Progress</h3>
                        <p className="text-amber-800/80 font-medium leading-relaxed text-xs">
                            A verification request was initiated on <strong>{new Date(pending.created_at).toLocaleDateString()}</strong>.
                            You cannot make new updates until this review is completed by the superadmin.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
                
                {/* Product / Regulatory Licenses selection */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-emerald-800 capitalize">Product / Regulatory Licenses *</h4>
                            <p className="text-[10px] text-gray-500 font-medium">Select available licenses or choose "Upload Later"</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {['Drug License', 'AYUSH License', 'FSSAI License', 'CBD / Hemp NOC', 'COA / Lab Reports'].map(license => {
                            const isChecked = selectedLicenses.includes(license);
                            return (
                                <button
                                    key={license}
                                    type="button"
                                    disabled={!!pending}
                                    onClick={() => {
                                        let newSelected: string[];
                                        if (isChecked) {
                                            newSelected = selectedLicenses.filter(l => l !== license);
                                        } else {
                                            newSelected = [...selectedLicenses.filter(l => l !== 'Upload Later'), license];
                                        }
                                        setSelectedLicenses(newSelected);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 select-none cursor-pointer ${
                                        isChecked 
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' 
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                                    }`}
                                >
                                    {isChecked && <Check size={12} strokeWidth={3} className="text-emerald-600 shrink-0" />}
                                    {license}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            disabled={!!pending}
                            onClick={() => {
                                const newSelected = selectedLicenses.includes('Upload Later') ? [] : ['Upload Later'];
                                setSelectedLicenses(newSelected);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 select-none cursor-pointer ${
                                selectedLicenses.includes('Upload Later')
                                    ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700'
                            }`}
                        >
                            {selectedLicenses.includes('Upload Later') && <Check size={12} strokeWidth={3} className="text-amber-600 shrink-0" />}
                            Upload Later
                        </button>
                    </div>
                </div>

                {/* Mandatory Compliance Documents Section */}
                <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
                        <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <Shield size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-850 capitalize">Mandatory Compliance Documents</h3>
                            <p className="text-[9px] text-gray-500 font-medium">These documents are strictly required for compliance clearance.</p>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-gray-50 flex flex-col">
                        {mandatoryDocs.map(renderDocRow)}
                    </div>
                </div>

                {/* Specific Documents Constitution type selection */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            ?
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-850 capitalize">Company Constitution Type</h3>
                            <p className="text-[10px] text-gray-500 font-medium">Verify or adjust your legal entity type to ensure matching requirements.</p>
                        </div>
                    </div>

                    <div className="bg-gray-50/60 p-1 rounded-xl border border-gray-150 flex flex-col md:flex-row gap-1">
                        {['Sole Proprietorship', 'Partnership Firm', 'Private Limited Company', 'LLP'].map(type => (
                            <button
                                key={type}
                                type="button"
                                disabled={!!pending}
                                onClick={() => setCompanyType(type)}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-semibold transition-all text-center capitalize select-none cursor-pointer ${
                                    companyType === type
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/40'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Optional Documents Section */}
                <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Info size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-850 capitalize">Optional Documents & Registrations</h3>
                            <p className="text-[9px] text-gray-500 font-medium">Provide additional optional certificates if available.</p>
                        </div>
                    </div>
                    
                    <div className="divide-y divide-gray-50 flex flex-col">
                        {optionalDocs.map(renderDocRow)}
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || !!pending || !hasChanges}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm capitalize shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-3"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <CheckCircle2 size={16} className="text-white" />
                        )}
                        Submit KYC Documents
                    </button>
                </div>
            </form>
        </div>
    );
}

function TaxTab({ settings, refresh }: any) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [defaultGstSlab, setDefaultGstSlab] = useState(() => 
        settings?.profile?.default_gst_slab !== undefined ? String(Number(settings.profile.default_gst_slab)) : '18'
    );
    const [defaultGstInclusive, setDefaultGstInclusive] = useState(() => 
        settings?.profile?.default_gst_inclusive ?? true
    );
    const [defaultHsnCode, setDefaultHsnCode] = useState(() => 
        settings?.profile?.default_hsn_code !== undefined ? String(settings.profile.default_hsn_code) : ''
    );

    const [hsnSearch, setHsnSearch] = useState(defaultHsnCode);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDesc, setSelectedDesc] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external defaultHsnCode changes to internal state
    useEffect(() => {
        setHsnSearch(defaultHsnCode);
    }, [defaultHsnCode]);

    // Fetch initial description if defaultHsnCode is pre-filled
    useEffect(() => {
        if (defaultHsnCode) {
            const fetchInitialDesc = async () => {
                try {
                    const res = await axios.get(`/hsn-codes?search=${defaultHsnCode}`);
                    const match = res.data.find((item: any) => item.code === defaultHsnCode);
                    if (match) {
                        setSelectedDesc(match.description);
                    }
                } catch (e) {
                    console.error("Failed to fetch initial HSN info", e);
                }
            };
            fetchInitialDesc();
        }
    }, []);

    // Handle search query with debounce
    useEffect(() => {
        if (!hsnSearch.trim()) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`/hsn-codes?search=${hsnSearch}`);
                setSuggestions(res.data);
            } catch (err) {
                console.error("Error fetching HSN codes:", err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [hsnSearch]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectHsn = (item: any) => {
        setIsOpen(false);
        setSuggestions([]);
        setSelectedDesc(item.description);
        setDefaultHsnCode(item.code);
        setHsnSearch(item.code);
    };

    const handleHsnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHsnSearch(val);
        setDefaultHsnCode(val);
        setIsOpen(true);
        setSelectedDesc(''); // Clear description on manual type/change
    };

    const pending = settings?.pending_requests?.tax?.[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await axios.post('/seller/settings/tax', {
                default_gst_slab: Number(defaultGstSlab),
                default_gst_inclusive: defaultGstInclusive,
                default_hsn_code: defaultHsnCode,
            });
            showToast(res.data.message || "Tax and HSN settings update submitted for review", "success");
            refresh();
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to submit default GST settings", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSyncProducts = async () => {
        setIsSyncing(true);
        try {
            const res = await axios.post('/seller/settings/tax/sync');
            showToast(res.data.message || "Successfully synced products.", "success");
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to sync products.", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="p-4 sm:p-10 space-y-6 sm:space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Default GST & Tax Parameters</h2>
                <p className="text-gray-500 text-sm font-medium">Configure global default tax rates to auto-apply on all newly listed products.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-semibold text-gray-555 capitalize tracking-wider flex items-center gap-2">
                            <span className="p-1.5 bg-cureza-green/10 text-cureza-green rounded-lg">
                                <Info size={14} />
                            </span>
                            Tax Hierarchy Logic
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                            1. **Global Default:** The settings defined here will be pre-filled automatically whenever you add new products to your shop.
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                            2. **Individual Overrides:** If a specific product falls under a different tax rate, you can edit that product's specific GST Slab and treatment directly within the Product Editor.
                        </p>
                    </div>

                    {pending && (
                        <div className="bg-amber-50/50 border border-amber-100 p-4 sm:p-6 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                <Clock size={64} />
                            </div>
                             <h3 className="text-xs font-semibold text-amber-700 capitalize mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Awaiting Super Admin Approval
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(pending.new_data).map(([key, val]: any) => {
                                    if (pending.old_data?.[key] === val) return null;
                                    return (
                                        <div key={key} className="flex flex-col border-b border-amber-100/30 pb-2">
                                            <span className="text-[10px] text-amber-600 capitalize font-semibold tracking-normal">{key.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-semibold text-amber-900">
                                                {key === 'default_gst_inclusive'
                                                    ? (val ? 'Inclusive (GST Included in Price)' : 'Exclusive (GST Added on Top)')
                                                    : (key === 'default_gst_slab' ? `${val}%` : String(val))
                                                }
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-4 text-xs text-amber-600 dark:text-amber-400 leading-relaxed font-medium">
                                This request has been submitted to the Super Admin. Once approved, the new default GST slab will be saved and you can sync it across all your products.
                            </p>
                            <p className="mt-6 text-[10px] text-amber-700 font-semibold capitalize border-t border-amber-100 pt-4 text-center">
                                Logged: {new Date(pending.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className={`space-y-8 ${pending ? 'opacity-35 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Default GST Slab <span className="text-red-500">*</span></label>
                                <select
                                    name="default_gst_slab"
                                    value={defaultGstSlab}
                                    onChange={(e) => setDefaultGstSlab(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all cursor-pointer text-gray-800"
                                >
                                    <option value="0">0% (GST Exempt / Nil Rate)</option>
                                    <option value="5">5% (GST)</option>
                                    <option value="12">12% (GST)</option>
                                    <option value="18">18% (GST Standard)</option>
                                    <option value="28">28% (GST Luxury)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Default GST Treatment</label>
                                <div className="flex items-center gap-3 h-11">
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            name="default_gst_inclusive"
                                            checked={defaultGstInclusive}
                                            onChange={(e) => setDefaultGstInclusive(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:bg-gray-900 dark:after:border-gray-600 peer-checked:bg-cureza-green"></div>
                                        <span className="ml-3 text-xs font-bold text-gray-900 dark:text-gray-100">
                                            {defaultGstInclusive ? 'Inclusive (GST Included in Price)' : 'Exclusive (GST Added on Top)'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2 relative" ref={wrapperRef}>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Default HSN Code <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="default_hsn_code"
                                    value={hsnSearch}
                                    onChange={handleHsnInputChange}
                                    onFocus={() => setIsOpen(true)}
                                    placeholder="e.g. 33019049"
                                    required
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all text-gray-800"
                                />

                                {isOpen && (hsnSearch.trim() !== '' || suggestions.length > 0 || isLoading) && (
                                    <div className="absolute z-[99] left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl divide-y divide-gray-100 dark:divide-gray-900 scrollbar-thin">
                                        {isLoading ? (
                                            <div className="p-4 text-xs font-semibold text-gray-400 dark:text-gray-555 flex items-center gap-2">
                                                <Loader2 size={14} className="animate-spin text-cureza-green" />
                                                Searching standard HSN registry...
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            suggestions.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => handleSelectHsn(item)}
                                                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors flex flex-col gap-1 outline-none"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-gray-955 dark:text-gray-100 tracking-wider">HSN {item.code}</span>
                                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">GST {Math.round(parseFloat(item.gst_rate))}%</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-550 dark:text-gray-400 font-medium line-clamp-2 leading-relaxed">{item.description}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-3 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                                No matching standard HSN. Press enter or click outside to use custom HSN: <strong className="text-gray-800 dark:text-gray-250 font-bold">{hsnSearch}</strong>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {selectedDesc && (
                                    <p className="text-[10px] text-emerald-650 dark:text-emerald-400 mt-1 font-semibold leading-relaxed">
                                        ✓ Standard HSN: {selectedDesc}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3">
                            <button
                                type="button"
                                onClick={handleSyncProducts}
                                disabled={isSyncing}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm capitalize shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 flex items-center gap-3"
                            >
                                {isSyncing ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Clock size={16} className="text-white" />
                                )}
                                Recheck & Sync All Products
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || !!pending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm capitalize shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 flex items-center gap-3"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Save size={16} className="text-white" />
                                )}
                                Save Default Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
