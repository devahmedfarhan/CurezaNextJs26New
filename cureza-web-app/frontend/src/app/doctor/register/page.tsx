'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, LogOut, User, Phone, ArrowRight, ShieldCheck,
    Stethoscope, CheckCircle, Upload, X, Eye, RefreshCw,
    Loader2, Save, Building2, Award
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import AuthFooter from '@/components/common/AuthFooter';

// --- Steps (Reduced to 4) ---
const STEPS = [
    { title: 'Profile & Profession', icon: User },
    { title: 'Clinic & Schedule', icon: Building2 },
    { title: 'Documents & KYC', icon: ShieldCheck },
    { title: 'Verification', icon: CheckCircle }
];

export default function DoctorRegisterPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    const [formData, setFormData] = useState({
        // Combined Section 1: Account & Professional
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        gender: '',
        date_of_birth: '',
        bio: '',
        specialization: '',
        years_of_experience: '',
        consultation_fee: '',
        consultation_duration: '15',
        consultation_modes: [] as string[],
        languages_spoken: [] as string[],

        // Combined Section 2: Clinic & Schedule
        clinic_name: '',
        clinic_address: '',
        clinic_city: '',
        clinic_state: '',
        clinic_pincode: '',
        available_days: [] as string[],
        time_slots: [] as any[],

        // Section 3: KYC & Docs
        medical_license_number: '',
        medical_council_name: '',
        state_council_name: '',
        registration_date: '',
        license_expiry_date: '',

        // Hidden / Extra fields maintained for API compatibility
        secondary_specializations: [] as string[],
        areas_of_expertise: [] as string[],
        treatable_conditions: [] as string[],
        education_history: [] as any[],
        highest_qualification: '',
        degree_name: '',
        completion_year: '',
        additional_certifications: [] as any[],
        google_map_link: '',
        timezone: 'Asia/Kolkata',
        emergency_availability: false,
        max_consultations_per_day: '',
        break_times: [] as any[],
        bank_account_holder: '',
        bank_name: '',
        bank_account_number: '',
        bank_ifsc: '',
        ayush_id: '',
        ayush_system_type: '',
        identity_proof_type: '',
        identity_proof_number: '',

        // Legal
        agreed_to_terms: false,
        agreed_to_telemedicine_guidelines: false,
        declaration_of_truth: false,
    });

    const [files, setFiles] = useState<Record<string, File | null>>({
        profile_photo: null,
        license_doc: null,
        identity_proof: null,
        ayush_document: null,
    });

    const [otpData, setOtpData] = useState({
        email_otp: '',
        mobile_otp: '',
        sending: false,
        timer: 0,
        dev_otp: null as { email: string, mobile: string } | null,
    });

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save as Draft - REMOVED per requirements
    // const saveDraft = async (silent = false) => { ... }

    // File Upload Helper Component
    const renderFileUpload = (fieldId: string, label: string) => {
        const file = files[fieldId];

        return (
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700">{label}</label>
                <div className={`border-2 border-dashed rounded-lg p-4 transition-all ${file ? 'border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-slate-400 bg-white'}`}>
                    {!file ? (
                        <label className="cursor-pointer flex flex-col items-center justify-center h-32 gap-2">
                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <Upload size={20} />
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-semibold text-slate-900">Click to upload</span>
                                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or PDF</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => setFiles(p => ({ ...p, [fieldId]: e.target.files?.[0] || null }))}
                            />
                        </label>
                    ) : (
                        <div className="space-y-4">
                            {/* Preview Area */}
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {file.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="text-slate-400" size={24} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 border-t border-slate-200 pt-3">
                                <button
                                    onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                                    className="flex-1 inline-flex items-center justify-center h-8 gap-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 transition-all"
                                >
                                    <Eye size={12} /> View
                                </button>
                                <label className="flex-1 cursor-pointer inline-flex items-center justify-center h-8 gap-2 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all">
                                    <RefreshCw size={12} /> Replace
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setFiles(p => ({ ...p, [fieldId]: e.target.files?.[0] || null }))}
                                    />
                                </label>
                                <button
                                    onClick={() => setFiles(p => ({ ...p, [fieldId]: null }))}
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                                >
                                    <LogOut size={12} className="rotate-180" /> {/* Using LogOut as a generic remove icon visually if Trash2 not ideal, but Trash2 is standard */}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Validation & Navigation
    const nextStep = () => {
        // Step 1: Personal & Professional
        if (currentStep === 1) {
            const required = ['first_name', 'last_name', 'email', 'phone', 'password', 'specialization', 'years_of_experience', 'consultation_fee'];
            const missing = required.filter(field => !formData[field as keyof typeof formData]);
            if (missing.length > 0) {
                showToast(`Please fill all required fields: ${missing.join(', ')}`, 'error');
                return;
            }
            setCurrentStep(2);
            window.scrollTo(0, 0);
        }

        // Step 2: Clinic & Schedule
        else if (currentStep === 2) {
            const required = ['clinic_name', 'clinic_city', 'clinic_pincode'];
            const missing = required.filter(field => !formData[field as keyof typeof formData]);
            if (missing.length > 0) {
                showToast('Please fill all clinic details', 'error');
                return;
            }
            if (formData.available_days.length === 0) {
                showToast('Please select at least one available day', 'error');
                return;
            }
            setCurrentStep(3);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    // Full Submission Handler (Replaces KYC Upload & Draft)
    const handleFullSubmission = async () => {
        if (!formData.medical_license_number || !files.license_doc || !files.identity_proof || !files.profile_photo) {
            showToast('Please fill all license details and upload all required documents (Photo, License, ID)', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();

            // Append all scalar fields
            Object.entries(formData).forEach(([key, value]) => {
                if (['profile_photo', 'license_doc', 'identity_proof', 'ayush_document'].includes(key)) return;

                if (value !== null && value !== undefined && value !== '') {
                    if (Array.isArray(value)) {
                        /* @ts-ignore */
                        value.forEach(item => data.append(`${key}[]`, String(item)));
                    } else if (typeof value === 'boolean') {
                        data.append(key, value ? '1' : '0');
                    } else {
                        data.append(key, String(value));
                    }
                }
            });

            // Append Files
            if (files.profile_photo) data.append('profile_photo', files.profile_photo);
            if (files.ayush_document) data.append('ayush_document', files.ayush_document);
            if (files.license_doc) data.append('license_doc', files.license_doc);
            if (files.identity_proof) data.append('identity_proof', files.identity_proof);

            const response = await api.post('/doctor/register-full', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Store Token
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                /* @ts-ignore */
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }

            // Set OTP Data
            if (response.data.dev_otp) {
                setOtpData(prev => ({
                    ...prev,
                    dev_otp: response.data.dev_otp,
                    timer: 60
                }));
            }

            showToast('Application Submitted. Please verify OTP.', 'success');
            setCurrentStep(4);
            window.scrollTo(0, 0);

        } catch (err: any) {
            console.error('Submission Failed:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to submit application';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyOTPs = async () => {
        if (otpData.email_otp.length < 6 || otpData.mobile_otp.length < 6) {
            showToast('Please enter both OTPs', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/doctor/verify-otp', {
                email_otp: otpData.email_otp,
                mobile_otp: otpData.mobile_otp
            });

            showToast('Application submitted successfully', 'success');
            setCurrentStep(6);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Verification failed';
            showToast(String(msg), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Timer Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpData.timer > 0) {
            interval = setInterval(() => {
                setOtpData(prev => ({ ...prev, timer: prev.timer - 1 }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpData.timer]);

    const handleResendOtp = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/doctor/resend-otp');
            setOtpData(prev => ({
                ...prev,
                timer: 60,
                dev_otp: response.data.dev_otp // Update dev OTP if provided
            }));
            showToast('OTP resent successfully', 'success');
        } catch (error: any) {
            showToast('Failed to resend OTP', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F8F3EF] flex flex-col text-[#052326] font-sans justify-between antialiased">
            <div className="w-full flex-1 flex flex-col lg:flex-row bg-[#F8F3EF] relative">
                {/* Left Side: Marketing Content */}
                <div className="hidden lg:flex lg:w-[45%] bg-[#052326] text-[#F8F3EF] p-16 flex-col justify-between relative overflow-hidden min-h-screen border-r border-[#052326]/10">
                    {/* Decorative glow element */}
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F0C417]/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F8F3EF]/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10">
                        <Link href="/" className="hover:opacity-95 transition-opacity inline-block shrink-0">
                            <img src="/logo-white.svg" alt="Cureza Logo" className="h-9 w-auto object-contain" />
                        </Link>

                        <div className="mt-24 space-y-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#F0C417]/20 text-[#F0C417] border border-[#F0C417]/30">
                                <Stethoscope size={10} className="animate-pulse" />
                                Practitioner Network
                            </span>
                            <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[#F8F3EF]">
                                Expand your practice <br />
                                <span className="text-[#F0C417]">digital first.</span>
                            </h1>
                            <p className="text-sm xl:text-base text-[#F8F3EF]/80 font-medium leading-relaxed max-w-md">
                                Join India's most trusted network of holistic healthcare providers. Get verified, manage appointments, and access a global patient base.
                            </p>
                        </div>

                        <div className="mt-16 space-y-5">
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Verified Profile Badge</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <Building2 size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Smart Practice Management</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 text-xs text-[#F8F3EF]/50 font-bold uppercase tracking-widest space-y-2">
                        <div>© 2026 Cureza Wellness • Doctor Verification</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium normal-case tracking-normal text-[#F8F3EF]/60 mt-2">
                            <Link href="/" className="hover:text-white hover:underline transition-colors">Home</Link>
                            <span className="text-[#F8F3EF]/30">•</span>
                            <Link href="/legal/privacy-policy" className="hover:text-white hover:underline transition-colors">Privacy Policy</Link>
                            <span className="text-[#F8F3EF]/30">•</span>
                            <Link href="/legal/terms-of-service" className="hover:text-white hover:underline transition-colors">Terms & Conditions</Link>
                            <span className="text-[#F8F3EF]/30">•</span>
                            <Link href="/support/faqs" className="hover:text-white hover:underline transition-colors">Help Center / FAQs</Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full lg:w-[55%] flex flex-col min-h-screen bg-[#F8F3EF]">
                    <div className="flex-1 px-6 py-12 lg:px-16 xl:px-24">
                    <div className="max-w-2xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Application</h2>
                                <p className="text-sm text-slate-500">
                                    {currentStep > STEPS.length ? 'Application Submitted' : `Step ${currentStep} of ${STEPS.length}`}
                                </p>
                            </div>
                            <div className="text-sm">
                                <span className="text-slate-500">Already registered? </span>
                                <Link href="/doctor/login" className="font-semibold text-slate-900 hover:underline">Login</Link>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="relative">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                                <div style={{ width: `${(currentStep / STEPS.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-slate-900 transition-all duration-500" />
                            </div>
                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                {STEPS.map((step, idx) => (
                                    <span key={idx} className={currentStep > idx ? 'text-slate-900' : ''}>{step.title}</span>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mt-8">
                            <AnimatePresence mode="wait">

                                {/* Step 1: Profile & Professional */}
                                {currentStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Personal Information</h3>

                                            {/* Profile Photo */}
                                            {renderFileUpload('profile_photo', 'Profile Photo')}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">First Name</label>
                                                    <input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="John" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Last Name</label>
                                                    <input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Doe" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Email</label>
                                                    <div className="relative">
                                                        <input name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent pl-10 px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                        <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Phone</label>
                                                    <div className="relative">
                                                        <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91..." className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent pl-10 px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                        <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Password</label>
                                                    <input name="password" type="password" value={formData.password} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Confirm Password</label>
                                                    <input name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Date of Birth</label>
                                                    <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Gender</label>
                                                    <select name="gender" value={formData.gender} onChange={handleInputChange as any} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all">
                                                        <option value="">Select</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-medium leading-none">Short Bio</label>
                                                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all resize-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Professional Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Primary Specialization</label>
                                                    <input name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g. Cardiologist" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Experience (Years)</label>
                                                    <input name="years_of_experience" type="number" value={formData.years_of_experience} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Fee (₹)</label>
                                                    <input name="consultation_fee" type="number" value={formData.consultation_fee} onChange={handleInputChange} placeholder="500" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Duration (Mins)</label>
                                                    <select name="consultation_duration" value={formData.consultation_duration} onChange={handleInputChange as any} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all">
                                                        <option value="15">15</option>
                                                        <option value="30">30</option>
                                                        <option value="45">45</option>
                                                        <option value="60">60</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-sm font-medium leading-none">Modes</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Chat', 'Video', 'Audio', 'In-person'].map(mode => (
                                                            <div key={mode} onClick={() => {
                                                                const current = formData.consultation_modes;
                                                                setFormData(p => ({ ...p, consultation_modes: current.includes(mode) ? current.filter(m => m !== mode) : [...current, mode] }));
                                                            }}
                                                                className={`cursor-pointer inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold transition-colors ${formData.consultation_modes.includes(mode) ? 'bg-slate-900 text-white border-transparent' : 'border-slate-200 text-slate-900'}`}
                                                            >
                                                                {mode}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Education Details - NEW */}
                                            <div className="pt-6 border-t">
                                                <h4 className="text-sm font-semibold text-slate-900 mb-4">Education & Qualification</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">Highest Qualification</label>
                                                        <input name="highest_qualification" value={formData.highest_qualification} onChange={handleInputChange} placeholder="MD / MBBS" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">Degree Name</label>
                                                        <input name="degree_name" value={formData.degree_name} onChange={handleInputChange} placeholder="Doctor of Medicine" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">Completion Year</label>
                                                        <input name="completion_year" type="number" value={formData.completion_year} onChange={handleInputChange} placeholder="2015" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">Languages Spoken</label>
                                                        <input name="languages_spoken" placeholder="English, Hindi (comma separated)"
                                                            onChange={(e) => setFormData(p => ({ ...p, languages_spoken: e.target.value.split(',').map(s => s.trim()) }))}
                                                            className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-6">
                                            <button onClick={nextStep} className="inline-flex items-center justify-center h-10 px-8 rounded-md bg-slate-900 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-all">Next</button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Clinic & Schedule */}
                                {currentStep === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Clinic Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-sm font-medium leading-none">Clinic Name</label>
                                                    <input name="clinic_name" value={formData.clinic_name} onChange={handleInputChange} placeholder="City Care" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-sm font-medium leading-none">Address</label>
                                                    <input name="clinic_address" value={formData.clinic_address} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">City</label>
                                                    <input name="clinic_city" value={formData.clinic_city} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Pincode</label>
                                                    <input name="clinic_pincode" value={formData.clinic_pincode} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-sm font-medium leading-none">Google Map Link</label>
                                                    <input name="google_map_link" value={formData.google_map_link} onChange={handleInputChange} placeholder="https://maps.google.com/..." className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>

                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-sm font-medium leading-none">Available Days</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                            <div key={day} onClick={() => {
                                                                const current = formData.available_days;
                                                                setFormData(p => ({ ...p, available_days: current.includes(day) ? current.filter(d => d !== day) : [...current, day] }));
                                                            }}
                                                                className={`cursor-pointer h-9 w-9 flex items-center justify-center rounded-full text-xs font-bold border transition-all ${formData.available_days.includes(day) ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border-slate-200'}`}
                                                            >
                                                                {day[0]}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Max Consultations/Day</label>
                                                    <input name="max_consultations_per_day" type="number" value={formData.max_consultations_per_day} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>

                                                <div className="space-y-2 flex items-center pt-6">
                                                    <input type="checkbox" id="emergency" checked={formData.emergency_availability} onChange={(e) => setFormData(p => ({ ...p, emergency_availability: e.target.checked }))} className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900" />
                                                    <label htmlFor="emergency" className="ml-2 text-sm font-medium leading-none">Available for Emergency?</label>
                                                </div>
                                            </div>

                                            {/* Banking Details - NEW */}
                                            <div className="pt-6 border-t">
                                                <h4 className="text-sm font-semibold text-slate-900 mb-4">Banking Information</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">Account Holder Name</label>
                                                        <input name="bank_account_holder" value={formData.bank_account_holder} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">Bank Name</label>
                                                        <input name="bank_name" value={formData.bank_name} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">Account Number</label>
                                                        <input name="bank_account_number" value={formData.bank_account_number} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none">IFSC Code</label>
                                                        <input name="bank_ifsc" value={formData.bank_ifsc} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between pt-6">
                                            <button onClick={prevStep} className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-900 hover:bg-slate-100 transition-all">Back</button>
                                            <button onClick={nextStep} className="inline-flex items-center justify-center h-10 px-8 rounded-md bg-slate-900 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-all">Next</button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Documents & KYC */}
                                {currentStep === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Medical Registration</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">License Number</label>
                                                    <input name="medical_license_number" value={formData.medical_license_number} onChange={handleInputChange} placeholder="MCN-12345" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Council</label>
                                                    <input name="medical_council_name" value={formData.medical_council_name} onChange={handleInputChange} placeholder="Medical Council of India" className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Council State</label>
                                                    <input name="state_council_name" value={formData.state_council_name} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">Registration Date</label>
                                                    <input name="registration_date" type="date" value={formData.registration_date} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none">License Expiry Date</label>
                                                    <input name="license_expiry_date" type="date" value={formData.license_expiry_date} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                </div>

                                                {/* AYUSH Details (Optional) */}
                                                <div className="md:col-span-2 pt-4 border-t mt-4">
                                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">AYUSH (Optional)</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium leading-none">AYUSH ID</label>
                                                            <input name="ayush_id" value={formData.ayush_id} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium leading-none">System Type</label>
                                                            <select name="ayush_system_type" value={formData.ayush_system_type} onChange={handleInputChange as any} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all">
                                                                <option value="">Select System</option>
                                                                <option value="Siddha">Siddha</option>
                                                                <option value="Homeopathy">Homeopathy</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2 pt-4 space-y-4">
                                                    <h4 className="text-sm font-semibold text-slate-900">Identity Proof</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium leading-none">ID Type</label>
                                                            <select name="identity_proof_type" value={formData.identity_proof_type} onChange={handleInputChange as any} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all">
                                                                <option value="">Select ID Type</option>
                                                                <option value="Aadhar">Aadhar Card</option>
                                                                <option value="PAN">PAN Card</option>
                                                                <option value="Passport">Passport</option>
                                                                <option value="Driving License">Driving License</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium leading-none">ID Number</label>
                                                            <input name="identity_proof_number" value={formData.identity_proof_number} onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* End of Section 1 in Step 3 */}

                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Documents</h3>
                                            <div className="grid grid-cols-1 gap-6">
                                                {renderFileUpload('license_doc', 'Medical License Copy')}
                                                {renderFileUpload('identity_proof', 'Government Identity Proof')}
                                                {renderFileUpload('ayush_document', 'AYUSH Registration (Optional)')}
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-6">
                                            <button onClick={prevStep} className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-900 hover:bg-slate-100 transition-all">Back</button>
                                            <button onClick={handleFullSubmission} className="inline-flex items-center justify-center h-10 px-8 rounded-md bg-slate-900 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-all">
                                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 4: Verify */}
                                {currentStep === 4 && (
                                    <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                        <div className="space-y-1 border-b pb-4 mb-4">
                                            <h3 className="text-lg font-semibold text-slate-900">Final Verification</h3>
                                            <p className="text-sm text-slate-500">Enter OTPs sent to your registered contacts.</p>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-6 border border-slate-100 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none text-slate-900 block text-center">Email OTP</label>
                                                    <div className="relative">
                                                        <input
                                                            value={otpData.email_otp}
                                                            onChange={(e) => setOtpData(p => ({ ...p, email_otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                                            className="flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-2xl font-mono tracking-[1em] placeholder:text-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                                                            placeholder="000000"
                                                            maxLength={6}
                                                        />
                                                    </div>
                                                    {otpData.dev_otp?.email && <p className="text-xs text-indigo-500 font-mono text-center mt-1">DEV OTP: {otpData.dev_otp.email}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium leading-none text-slate-900 block text-center">Mobile OTP</label>
                                                    <div className="relative">
                                                        <input
                                                            value={otpData.mobile_otp}
                                                            onChange={(e) => setOtpData(p => ({ ...p, mobile_otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                                            className="flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-2xl font-mono tracking-[1em] placeholder:text-slate-200 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                                                            placeholder="000000"
                                                            maxLength={6}
                                                        />
                                                    </div>
                                                    {otpData.dev_otp?.mobile && <p className="text-xs text-indigo-500 font-mono text-center mt-1">DEV OTP: {otpData.dev_otp.mobile}</p>}
                                                </div>
                                            </div>

                                            {/* Resend Timer & Button */}
                                            <div className="flex justify-center pt-2">
                                                {otpData.timer > 0 ? (
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                        <span>Resend OTP in <span className="text-slate-900">00:{otpData.timer.toString().padStart(2, '0')}</span></span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); handleResendOtp(); }}
                                                        className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-green-600 transition-colors"
                                                    >
                                                        <RefreshCw size={16} />
                                                        Resend OTP
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-2">
                                                <input type="checkbox" id="terms" checked={formData.agreed_to_terms} onChange={(e) => setFormData(p => ({ ...p, agreed_to_terms: e.target.checked }))} className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                                                <label htmlFor="terms" className="text-sm text-slate-600">I agree to the <a href="#" className="font-semibold text-slate-900 underline">Terms of Service</a> & <a href="#" className="font-semibold text-slate-900 underline">Privacy Policy</a></label>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <input type="checkbox" id="telemed" checked={formData.agreed_to_telemedicine_guidelines} onChange={(e) => setFormData(p => ({ ...p, agreed_to_telemedicine_guidelines: e.target.checked }))} className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                                                <label htmlFor="telemed" className="text-sm text-slate-600">I agree to follow Telemedicine Practice Guidelines.</label>
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-6">
                                            <button onClick={prevStep} className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-900 hover:bg-slate-100 transition-all">Back</button>
                                            <button onClick={verifyOTPs} disabled={isSubmitting || !formData.agreed_to_terms} className="inline-flex items-center justify-center h-10 px-8 rounded-md bg-green-600 text-sm font-semibold text-white shadow hover:bg-green-700 transition-all disabled:opacity-70">
                                                {isSubmitting ? 'Verifying...' : 'Submit'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 6 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                                        <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50">
                                            <CheckCircle size={48} />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Application Submitted!</h2>
                                            <p className="text-slate-500 max-w-md mx-auto">Thank you for registering with Cureza. Your application is now under review.</p>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 w-full max-w-sm space-y-4">
                                            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-3">
                                                <span className="text-slate-500">Application ID</span>
                                                <span className="font-mono font-medium text-slate-900">Pending</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Submitted On</span>
                                                <span className="font-medium text-slate-900">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Link href="/doctor/login" className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                                                Return to Login
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
