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

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 mb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Account Intelligence</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Coordinate your security, communication channels, and financial parameters.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-1">
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

                {/* Content Area */}
                <div className="flex-1 min-w-0">
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
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-extrabold transition-all relative ${active
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <Icon size={18} className={active ? 'text-cureza-green' : 'text-gray-400'} />
            {label}
            {active && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-cureza-green" />
            )}
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
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Vault Logic</h2>
                <p className="text-gray-500 text-sm font-medium">Manage access credentials and session parameters.</p>
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
                                <span className="px-3 py-1 bg-white text-cureza-green text-[10px] font-extrabold rounded-lg shadow-sm border border-emerald-50 uppercase tracking-wider">{settings.user.role}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Protocol Status</span>
                                <span className="px-3 py-1 bg-white text-blue-600 text-[10px] font-extrabold rounded-lg shadow-sm border border-blue-50 uppercase tracking-wider">{settings.account_info.status}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100/50 pb-3">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Last Auth Login</span>
                                <span className="text-xs font-bold text-gray-700">{settings.account_info.last_login_at || 'NEVER'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Primary Contact</span>
                                <span className="text-xs font-bold text-gray-700">{settings.user.email}</span>
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
    const [vals, setVals] = useState(settings.notifications || {
        order_notifications: true,
        payment_notifications: true,
        ticket_notifications: true,
        email_notifications: true,
        in_app_notifications: true,
        whatsapp_notifications: false
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
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Transmission Flow</h2>
                <p className="text-gray-500 text-sm font-medium">Configure how system intelligence interacts with you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] px-1">Logic Clusters</h3>
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
            bank_name: settings.profile?.bank_name || '',
            branch_name: settings.profile?.branch_name || '',
            bank_account_number: settings.profile?.bank_account_number || '',
            ifsc_code: settings.profile?.ifsc_code || '',
            bic_swift_code: settings.profile?.bic_swift_code || '',
            gst_number: settings.profile?.gst_number || '',
            pan_number: settings.profile?.pan_number || '',
        }
    });

    const pending = settings.pending_requests?.bank?.[0];
    const profile = settings.profile || {};

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
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Liquidity Parameters</h2>
                    <p className="text-gray-500 text-sm font-medium">Manage settlement routes and financial identity.</p>
                </div>
                <div className="flex gap-2">
                    <span className={`text-[10px] px-4 py-1.5 rounded-xl font-extrabold uppercase tracking-widest border shadow-sm ${profile.bank_account_number ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                        {profile.bank_account_number ? 'Verified Channel' : 'Identity Incomplete'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Current Settings + Pending */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-6 px-1">Active Ledger Info</h3>
                        <div className="space-y-6">
                            <InfoRow label="Financial Institution" value={profile.bank_name || 'NOT_DEFINED'} />
                            <InfoRow label="Routing Identifier" value={profile.bank_account_number || 'HIDDEN'} />
                            <InfoRow label="Swift/IFSC Registry" value={profile.ifsc_code || 'N/A'} />
                            <InfoRow label="Fiscal ID (PAN)" value={profile.pan_number || 'NOT_LINKED'} />
                        </div>
                    </div>

                    {pending && (
                        <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                <Clock size={64} />
                            </div>
                            <h3 className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Synchronization Pending
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
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Bank Institution Name</label>
                                <input {...register('bank_name', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="e.g. HDFC Bank" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Regional Branch Location</label>
                                <input {...register('branch_name')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Branch location" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Registry Account Serial</label>
                                <input {...register('bank_account_number', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Numbers only" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">IFSC / Routing Protocol</label>
                                <input {...register('ifsc_code', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="HDFC0001234" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Government Fiscal ID (PAN)</label>
                                <input {...register('pan_number')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="ABCDE1234F" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">GST/VAT Index (Optional)</label>
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
    const { register, handleSubmit } = useForm({
        defaultValues: {
            brand_name: settings.brand?.name || '',
            short_description: settings.brand?.short_description || '',
            phone: settings.user?.phone || '',
            website: settings.profile?.has_website || '',
            address_line_1: settings.profile?.address_line_1 || '',
            city: settings.profile?.city || '',
            state: settings.profile?.state || '',
            country: settings.profile?.country || '',
            pin_code: settings.profile?.pin_code || '',
            business_type: settings.profile?.registering_as || '',
        }
    });

    const pending = settings.pending_requests?.profile?.[0];
    const profile = settings.profile || {};

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await axios.post('/seller/settings/profile', data);
            showToast("Profile update submitted", "success");
            refresh();
        } catch (err: any) {
            showToast("Failed to submit", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-10 space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Enterprise Identity</h2>
                <p className="text-gray-500 text-sm font-medium">Coordinate your global business profile and contact vectors.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Overview */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-6 px-1">Registry Overview</h3>
                        <div className="space-y-6">
                            <InfoRow label="Brand Entity" value={settings.brand?.name || 'NOT_DEFINED'} />
                            <InfoRow label="Business Tier" value={profile.registering_as || 'Standard'} />
                            <InfoRow label="Auth Email" value={settings.user.email} />
                            <InfoRow label="Telecom ID" value={settings.user.phone || '9870000000'} />
                            <InfoRow label="Web Asset" value={profile.has_website || 'NONE'} />
                            <div className="pt-4 border-t border-gray-100/50">
                                <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest block mb-2">Registered Workspace</span>
                                <p className="text-sm font-bold text-gray-800 leading-relaxed">
                                    {profile.address_line_1 || 'LOC_NOT_SET'}, {profile.city || 'CITY_NOT_SET'} <br />
                                    {profile.state || 'STATE_NOT_SET'} - {profile.pin_code || '000000'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {pending && (
                        <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform">
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
                                            <span className="text-sm font-extrabold text-blue-900">{val}</span>
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
                    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-10 ${pending ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Legal Brand Entity</label>
                                <input {...register('brand_name', { required: true })} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Primary Telecom Link</label>
                                <input {...register('phone')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Digital Domain (URL)</label>
                                <input {...register('website')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Enterprise Category</label>
                                <select {...register('business_type')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all appearance-none">
                                    <option value="Individual">Individual Contributor</option>
                                    <option value="Brand">Established Brand</option>
                                    <option value="Manufacturer">Primary Manufacturer</option>
                                    <option value="Reseller">Authorized Reseller</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] block px-1">Registered Logistics Node</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-3">
                                    <input {...register('address_line_1')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Full Address Line" />
                                </div>
                                <input {...register('city')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="City" />
                                <input {...register('state')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="State/Region" />
                                <input {...register('pin_code')} className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all" placeholder="Pincode" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting || !!pending}
                                className="bg-gray-900 text-white px-10 py-4 rounded-3xl font-extrabold text-xs uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-black transition-all disabled:bg-gray-200 disabled:text-gray-400"
                            >
                                {isSubmitting ? 'Processing Identity Update...' : 'Commit Enterprise Changes'}
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
    const [previews, setPreviews] = useState<any>({});
    const { register, handleSubmit, reset } = useForm();

    const pending = settings.pending_requests?.kyc?.[0];
    const profile = settings.profile || {};

    const docTypes = [
        { key: 'pan', label: 'PAN Card', field: 'pan_image' },
        { key: 'gst', label: 'GST Certificate', field: 'gst_image' },
        { key: 'aadhaar', label: 'Aadhaar Card', field: 'aadhaar_image' },
        { key: 'cheque', label: 'Cancelled Cheque', field: 'cheque_image' },
        { key: 'signature', label: 'Digital Signature', field: 'signature_image' },
    ];

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        const formData = new FormData();

        docTypes.forEach(doc => {
            if (data[doc.field]?.[0]) {
                formData.append(doc.field, data[doc.field][0]);
            }
        });

        if (data.aadhaar_number) {
            formData.append('aadhaar_number', data.aadhaar_number);
        }

        try {
            await axios.post('/seller/settings/kyc', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast("KYC documents submitted", "success");
            setPreviews({});
            reset();
            refresh();
        } catch (err: any) {
            showToast("Failed to upload KYC", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: any, key: string, r_onChange: any) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setPreviews({ ...previews, [key]: 'pdf' });
            } else {
                setPreviews({ ...previews, [key]: URL.createObjectURL(file) });
            }
        }
        r_onChange(e);
    };

    return (
        <div className="p-10 space-y-10">
            <div className="border-b border-gray-50 pb-6">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Compliance Registry (KYC)</h2>
                <p className="text-gray-500 text-sm font-medium">Verified documents required for full marketplace clearance.</p>
            </div>

            {pending && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8 flex gap-6 items-start animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-amber-900 font-extrabold text-lg tracking-tight mb-1">Verification Stream Active</h3>
                        <p className="text-amber-800/80 font-medium leading-relaxed">
                            A multi-factor verification request was initiated on <strong>{new Date(pending.created_at).toLocaleDateString()}</strong>.
                            Protocol completion usually takes 24-48 business hours.
                        </p>
                    </div>
                </div>
            )}

            {/* Document Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {docTypes.map(doc => {
                    const status = profile[`${doc.key}_status`] || 'pending';
                    let imagePath = profile[`${doc.key}_image_path`];
                    if (imagePath && imagePath.startsWith('/storage/')) {
                        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                        imagePath = `${backendUrl}${imagePath}`;
                    }

                    return (
                        <div key={doc.key} className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 flex flex-col gap-4 group transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/50">
                            <div className="flex justify-between items-start">
                                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mt-1">{doc.label}</p>
                                <span className={`text-[8px] px-2 py-1 rounded-lg font-extrabold uppercase tracking-tighter ${status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                    status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}>
                                    {status}
                                </span>
                            </div>
                            <div className="aspect-[4/3] bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100/50 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                                {imagePath ? (
                                    imagePath.toLowerCase().endsWith('.pdf') ? (
                                        <div className="flex flex-col items-center">
                                            <div className="p-3 bg-rose-50 rounded-2xl mb-2">
                                                <FileText size={24} className="text-rose-500" />
                                            </div>
                                            <span className="text-[8px] font-extrabold text-gray-400 uppercase">Registry PDF</span>
                                        </div>
                                    ) : (
                                        <img src={imagePath} alt={doc.label} className="w-full h-full object-cover" />
                                    )
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-2xl">
                                        <FileText className="text-gray-300" size={24} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-10 ${pending ? 'opacity-30 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Global Identity Number (Aadhaar)</label>
                        <input
                            {...register('aadhaar_number')}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none transition-all"
                            defaultValue={profile.aadhaar_number}
                            placeholder="0000 0000 0000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {docTypes.map(doc => (
                        <div key={doc.key} className="space-y-4">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">{doc.label} Digital Transmission</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    {...register(doc.field)}
                                    onChange={(e) => {
                                        const { onChange: r_onChange } = register(doc.field);
                                        handleFileChange(e, doc.key, r_onChange);
                                    }}
                                    className="hidden"
                                    id={`file-${doc.key}`}
                                />
                                <label
                                    htmlFor={`file-${doc.key}`}
                                    className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-100 rounded-[2.5rem] cursor-pointer hover:border-cureza-green transition-all overflow-hidden bg-gray-50/50 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-gray-200"
                                >
                                    {previews[doc.key] ? (
                                        previews[doc.key] === 'pdf' ? (
                                            <div className="flex flex-col items-center text-rose-500">
                                                <FileText size={48} />
                                                <p className="text-[10px] font-extrabold mt-3 uppercase tracking-widest text-gray-400">PDF Asset Validated</p>
                                            </div>
                                        ) : (
                                            <img src={previews[doc.key]} className="w-full h-full object-cover" alt="Preview" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-white rounded-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                <Upload className="text-gray-400 group-hover:text-cureza-green" size={32} />
                                            </div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Deploy {doc.label} Ledger</p>
                                        </div>
                                    )}
                                </label>
                                {previews[doc.key] && (
                                    <button
                                        type="button"
                                        onClick={() => setPreviews({ ...previews, [doc.key]: null })}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-rose-500 p-2 rounded-2xl shadow-xl hover:bg-rose-500 hover:text-white transition-all scale-90 hover:scale-100"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-10">
                    <button
                        type="submit"
                        disabled={isSubmitting || !!pending}
                        className="bg-gray-900 text-white px-12 py-5 rounded-[2.5rem] font-extrabold text-sm uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-black hover:scale-[1.02] transition-all disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-4"
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <CheckCircle2 size={24} className="text-cureza-green" />
                        )}
                        Synchronize KYC Records
                    </button>
                </div>
            </form>
        </div>
    );
}
