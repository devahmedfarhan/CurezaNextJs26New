'use client';

import { useState, useEffect } from 'react';
import { 
    User, Lock, Bell, CreditCard, Clock, Calendar, Shield, Save, 
    RefreshCw, CheckCircle, MapPin, Eye, EyeOff, AlertCircle 
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DoctorSettingsPage() {
    const { showToast } = useToast();

    // Loading & Data State
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('consultation');

    // Settings Form State
    const [formData, setFormData] = useState<any>({
        consultation_fee: 0,
        consultation_duration: 15,
        consultation_modes: [],
        max_consultations_per_day: 10,
        emergency_availability: false,
        clinic_name: '',
        clinic_address: '',
        clinic_city: '',
        clinic_state: '',
        clinic_pincode: '',
        google_map_link: '',
        available_days: [],
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctor/profile');
            const data = response.data;
            setDoctor(data);

            // Populate form values from profile data
            setFormData({
                consultation_fee: data.consultation_fee || 0,
                consultation_duration: data.consultation_duration || 15,
                consultation_modes: Array.isArray(data.consultation_modes) ? data.consultation_modes : [],
                max_consultations_per_day: data.max_consultations_per_day || 10,
                emergency_availability: !!data.emergency_availability,
                clinic_name: data.clinic_name || '',
                clinic_address: data.clinic_address || '',
                clinic_city: data.clinic_city || '',
                clinic_state: data.clinic_state || '',
                clinic_pincode: data.clinic_pincode || '',
                google_map_link: data.google_map_link || '',
                available_days: Array.isArray(data.available_days) ? data.available_days : [],
            });
        } catch (error) {
            showToast('Failed to load settings data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const toggleMode = (mode: string) => {
        setFormData((prev: any) => {
            const current = prev.consultation_modes || [];
            const updated = current.includes(mode)
                ? current.filter((m: string) => m !== mode)
                : [...current, mode];
            return { ...prev, consultation_modes: updated };
        });
    };

    const toggleDay = (day: string) => {
        setFormData((prev: any) => {
            const current = prev.available_days || [];
            const updated = current.includes(day)
                ? current.filter((d: string) => d !== day)
                : [...current, day];
            return { ...prev, available_days: updated };
        });
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            const payload = {
                ...formData,
                // Ensure correct type representations
                consultation_fee: parseFloat(formData.consultation_fee) || 0,
                consultation_duration: parseInt(formData.consultation_duration) || 15,
                max_consultations_per_day: parseInt(formData.max_consultations_per_day) || 10,
                emergency_availability: formData.emergency_availability ? 1 : 0,
            };

            await api.put('/doctor/profile', payload);
            showToast('Settings update request submitted for admin approval', 'success');
            
            // Refresh to see update flags
            fetchSettings();
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to save settings';
            showToast(message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            showToast('New passwords do not match', 'error');
            return;
        }

        try {
            setPasswordLoading(true);
            await api.post('/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                new_password_confirmation: passwordData.new_password_confirmation,
            });
            showToast('Password changed successfully', 'success');
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to change password';
            const errors = error.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0] as string[];
                showToast(firstError[0] || message, 'error');
            } else {
                showToast(message, 'error');
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-cureza-green" />
                <p className="text-sm font-medium animate-pulse">Loading settings...</p>
            </div>
        );
    }

    const hasPendingUpdates = doctor && !!doctor.pending_updates;

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-base font-bold tracking-tight text-gray-800">Settings</h1>
                    <p className="text-[11px] text-gray-400 mt-0.5">Manage availability, fees, clinic details, and security</p>
                </div>
                {doctor && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <Badge className={
                            doctor.doctor_status === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                        }>
                            {doctor.doctor_status === 'approved' ? 'Active & Approved' : 'Pending Verification'}
                        </Badge>
                    </div>
                )}
            </div>

            {hasPendingUpdates && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="font-semibold text-amber-900">Pending Changes Under Review</AlertTitle>
                    <AlertDescription className="text-amber-800 text-sm">
                        You have recently submitted updates that are currently waiting for admin approval. 
                        Your active settings remain live until approved.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Left Navigation Card */}
                <Card className="lg:col-span-1 border-black/[0.05] bg-white">
                    <CardContent className="p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('consultation')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'consultation'
                                    ? 'bg-cureza-green text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <CreditCard className="h-4 w-4" />
                            Consultation & Fees
                        </button>
                        <button
                            onClick={() => setActiveTab('clinic')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'clinic'
                                    ? 'bg-cureza-green text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <Calendar className="h-4 w-4" />
                            Clinic & Timing
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === 'security'
                                    ? 'bg-cureza-green text-white'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <Lock className="h-4 w-4" />
                            Security & Account
                        </button>
                    </CardContent>
                </Card>

                {/* Right Settings Form Container */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === 'consultation' && (
                        <Card className="border-black/[0.05] bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <CreditCard className="h-5 w-5 text-cureza-green" />
                                    Consultation Settings
                                </CardTitle>
                                <CardDescription>Configure pricing, duration, and default consultation rules.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="consultation_fee" className="font-semibold text-slate-700">Video & General Consultation Fee (₹)</Label>
                                        <Input
                                            id="consultation_fee"
                                            name="consultation_fee"
                                            type="number"
                                            value={formData.consultation_fee}
                                            onChange={handleInputChange}
                                            className="focus-visible:ring-cureza-green"
                                            placeholder="500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="consultation_duration" className="font-semibold text-slate-700">Duration Per Slot (Minutes)</Label>
                                        <select
                                            id="consultation_duration"
                                            value={formData.consultation_duration}
                                            onChange={(e) => handleSelectChange('consultation_duration', e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cureza-green focus-visible:ring-offset-2"
                                        >
                                            <option value="15">15 Minutes</option>
                                            <option value="30">30 Minutes</option>
                                            <option value="45">45 Minutes</option>
                                            <option value="60">60 Minutes</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="max_consultations_per_day" className="font-semibold text-slate-700">Max Bookings Per Day</Label>
                                        <Input
                                            id="max_consultations_per_day"
                                            name="max_consultations_per_day"
                                            type="number"
                                            value={formData.max_consultations_per_day}
                                            onChange={handleInputChange}
                                            className="focus-visible:ring-cureza-green"
                                            placeholder="10"
                                        />
                                    </div>
                                    <div className="space-y-2 flex flex-col justify-end pb-1.5">
                                        <label className="flex items-center gap-3 border border-slate-200 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={formData.emergency_availability}
                                                onChange={(e) => handleSelectChange('emergency_availability', e.target.checked)}
                                                className="h-4.5 w-4.5 text-cureza-green rounded focus:ring-cureza-green"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">Emergency Availability</span>
                                                <span className="text-xs text-muted-foreground">Mark yourself active for critical / on-call care</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="font-semibold text-slate-700">Supported Consultation Modes</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Chat', 'Video', 'Audio', 'In-person'].map((mode) => {
                                            const active = formData.consultation_modes.includes(mode);
                                            return (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => toggleMode(mode)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                                        active 
                                                            ? 'bg-cureza-green text-white border-transparent'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {mode}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-slate-50 bg-slate-50/50 p-4 flex justify-end">
                                <Button 
                                    onClick={handleSaveSettings} 
                                    disabled={saving} 
                                    className="bg-cureza-green hover:bg-green-700 font-bold"
                                >
                                    {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Consultation Settings
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === 'clinic' && (
                        <Card className="border-black/[0.05] bg-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                    <Calendar className="h-5 w-5 text-cureza-green" />
                                    Clinic Details & Weekly Schedule
                                </CardTitle>
                                <CardDescription>Update where you practice and specify your working days of the week.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="clinic_name" className="font-semibold text-slate-700">Clinic / Practice Name</Label>
                                        <Input
                                            id="clinic_name"
                                            name="clinic_name"
                                            value={formData.clinic_name}
                                            onChange={handleInputChange}
                                            className="focus-visible:ring-cureza-green"
                                            placeholder="Arogya Medical Center"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="clinic_address" className="font-semibold text-slate-700">Full Practice Address</Label>
                                        <Textarea
                                            id="clinic_address"
                                            name="clinic_address"
                                            value={formData.clinic_address}
                                            onChange={handleInputChange}
                                            className="focus-visible:ring-cureza-green"
                                            placeholder="123 Wellness Blvd, Healthcare Dist."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clinic_city" className="font-semibold text-slate-700">City</Label>
                                        <Input
                                            id="clinic_city"
                                            name="clinic_city"
                                            value={formData.clinic_city}
                                            onChange={handleInputChange}
                                            className="focus-visible:ring-cureza-green"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clinic_pincode" className="font-semibold text-slate-700">Pincode</Label>
                                        <Input
                                            id="clinic_pincode"
                                            name="clinic_pincode"
                                            value={formData.clinic_pincode}
                                            onChange={handleInputChange}
                                            className="focus-visible:ring-cureza-green"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="google_map_link" className="font-semibold text-slate-700">Google Map Link</Label>
                                        <Input
                                            id="google_map_link"
                                            name="google_map_link"
                                            value={formData.google_map_link}
                                            onChange={handleInputChange}
                                            className="focus-visible:ring-cureza-green"
                                            placeholder="https://maps.google.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="font-semibold text-slate-700">Available Days of the Week</Label>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                            const active = formData.available_days.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleDay(day)}
                                                    className={`py-3 px-1 rounded-xl text-xs font-bold border transition-all ${
                                                        active 
                                                            ? 'bg-cureza-green text-white border-transparent'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-slate-50 bg-slate-50/50 p-4 flex justify-end">
                                <Button 
                                    onClick={handleSaveSettings} 
                                    disabled={saving} 
                                    className="bg-cureza-green hover:bg-green-700 font-bold"
                                >
                                    {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Clinic & Schedule
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Security / Password Card */}
                            <Card className="border-black/[0.05] bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                        <Lock className="h-5 w-5 text-cureza-green" />
                                        Update Password
                                    </CardTitle>
                                    <CardDescription>Keep your account secure by updating your credential password periodically.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handlePasswordChange}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="current_password"
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordData.current_password}
                                                    onChange={(e) => setPasswordData(p => ({ ...p, current_password: e.target.value }))}
                                                    className="pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="new_password">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="new_password"
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordData.new_password}
                                                    onChange={(e) => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                                                    className="pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 relative">
                                            <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="new_password_confirmation"
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordData.new_password_confirmation}
                                                    onChange={(e) => setPasswordData(p => ({ ...p, new_password_confirmation: e.target.value }))}
                                                    className="pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t border-slate-50 bg-slate-50/50 p-4 flex justify-end">
                                        <Button 
                                            type="submit" 
                                            disabled={passwordLoading} 
                                            className="bg-cureza-green hover:bg-green-700 font-bold"
                                        >
                                            {passwordLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                                            Change Password
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            {/* Account Details / Non-editable Card */}
                            <Card className="border-black/[0.05] bg-white">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-slate-800">Primary Account Metadata</CardTitle>
                                    <CardDescription>Primary profile credentials. Contact support to modify these values.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-500 font-semibold">Registered Email</span>
                                        <span className="text-slate-800 font-mono">{doctor.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-500 font-semibold">Phone Number</span>
                                        <span className="text-slate-800 font-mono">{doctor.phone}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-500 font-semibold">Specialization</span>
                                        <span className="text-slate-800 font-semibold">{doctor.specialization}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
