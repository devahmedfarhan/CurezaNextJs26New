'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Mail, Lock, User, Phone, ArrowRight, Store,
    ShieldCheck, TrendingUp, Upload, CheckCircle,
    AlertCircle, Building2, MapPin, CreditCard,
    ChevronRight, Info, Loader2, Stethoscope, Save,
    Truck, Tag, Wallet, Check, ShoppingCart, Search,
    FileText, RotateCw, X, ScrollText
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { indianLocations } from '@/data/indianLocations';
import AuthFooter from '@/components/common/AuthFooter';

const SOURCING_METHODS = ["I manufacture them", "I sell products manufactured for me", "I resell what I buy", "I import them"];
const TURNOVER_RANGES = ["Less than 1 Lakh", "1 Lakh - 10 Lakh", "10 Lakh - 50 Lakh", "50 Lakh - 1 Crore", "Over 1 Crore"];
const REFERRAL_SOURCES = ["Instagram", "Facebook", "Google Search", "Friend/Colleague", "LinkedIn", "Other"];

// --- UI Helper Components (Moved outside to fix focus issues) ---

const InputField = ({ label, name, value, onChange, validationErrors, type = "text", required = false, placeholder, className = "" }: any) => (
    <div className={`space-y-1 ${className}`}>
        <label className="text-[11px] font-bold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            name={name}
            required={required}
            value={value || ''}
            onChange={onChange}
            className={`flex h-9 w-full rounded-[10px] border ${validationErrors?.[name] ? 'border-red-500' : 'border-gray-200'} bg-white px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-950 transition-all`}
            placeholder={placeholder}
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false }: any) => (
    <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
        <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="flex h-9 w-full rounded-[10px] border border-gray-200 bg-white px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-950 transition-all"
        >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const MultiSelectField = ({ label, name, selectedValues, options, onToggle }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-700">{label}</label>
        <div className="flex flex-wrap gap-1.5">
            {options.map((opt: string) => {
                const isSelected = selectedValues.includes(opt);
                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onToggle(name, opt)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${isSelected
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    </div>
);

// --- Extracted Components to Fix Focus Issues ---

interface KYCDocumentRowProps {
    doc: any;
    files: Record<string, File | null>;
    savedDocs: Record<string, string>;
    setSavedDocs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    uploadProgress: Record<string, number>;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    profile: any;
}

const getLegacyKey = (key: string) => {
    if (key === 'license_ayush_license') return 'license_ayush';
    if (key === 'license_fssai_license') return 'license_fssai';
    if (key === 'license_drug_license') return 'license_drug';
    return null;
};

const KYCDocumentRow = ({ doc, files, savedDocs, setSavedDocs, uploadProgress, formData, setFormData, setFiles, showToast, profile }: KYCDocumentRowProps) => {
    const legacyId = getLegacyKey(doc.id);
    const file = files[doc.id] || (legacyId ? files[legacyId] : null);
    const serverPath = savedDocs[doc.id] || (legacyId ? savedDocs[legacyId] : '');
    const isOnServer = !!serverPath;
    const progress = uploadProgress[doc.id] || (legacyId ? uploadProgress[legacyId] : undefined);
    const isUploaded = !!file || isOnServer;

    let docStatus = 'pending';
    if (profile) {
        docStatus = profile[`${doc.id}_status`] || profile.kyc_document_statuses?.[doc.id] || 'pending';
        if (legacyId && (!profile[`${doc.id}_status`] && !profile.kyc_document_statuses?.[doc.id])) {
            docStatus = profile[`${legacyId}_status`] || profile.kyc_document_statuses?.[legacyId] || docStatus;
        }
    }
    
    let docReason = '';
    if (profile) {
        docReason = profile.kyc_document_reasons?.[doc.id] || '';
        if (legacyId && !profile.kyc_document_reasons?.[doc.id]) {
            docReason = profile.kyc_document_reasons?.[legacyId] || '';
        }
    }

    return (
        <div className={`group relative p-5 bg-white border rounded-[10px] transition-all duration-300 ${docStatus === 'rejected'
            ? 'border-red-200 bg-red-50/5 hover:border-red-300'
            : isUploaded
                ? 'border-[#052326]/10 bg-[#052326]/5'
                : 'border-gray-100 hover:border-gray-200'
            }`}>
            {/* Status Badge */}
            <div className="flex justify-end mb-2 gap-2">
                {docStatus === 'rejected' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black animate-pulse">
                        Rejected
                    </div>
                )}
                {docStatus === 'approved' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052326]/10 text-[#052326] text-[10px] font-bold">
                        <CheckCircle size={12} className="fill-[#052326] text-white" />
                        Approved
                    </div>
                )}
                {docStatus !== 'rejected' && docStatus !== 'approved' && (
                    isUploaded ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052326]/10 text-[#052326] text-[10px] font-bold">
                            <CheckCircle size={12} className="fill-[#052326] text-white" />
                            {isOnServer ? 'Saved' : 'Ready'}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Pending
                        </div>
                    )
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Icon & Label */}
                <div className="flex items-start gap-4 pr-12">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${docStatus === 'rejected'
                        ? 'bg-red-100 text-red-600'
                        : isUploaded ? 'bg-[#052326]/10 text-[#052326]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                        {doc.id.includes('pan') ? <CreditCard size={20} /> : doc.id.includes('gst') ? <FileText size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                            {doc.label} {doc.required && <span className="text-red-500">*</span>}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[200px]">
                            {doc.description || 'Upload document in PDF, JPG or PNG format. Max size 2MB.'}
                        </p>
                        {docStatus === 'rejected' && docReason && (
                            <div className="text-[10px] text-red-700 bg-red-100/50 border border-red-200 rounded-xl p-3 font-bold mt-2 leading-relaxed">
                                <span className="block text-[8px] uppercase tracking-wider text-red-500 mb-0.5">Discrepancy Feedback:</span>
                                {docReason}
                            </div>
                        )}
                    </div>
                </div>

                {/* Inputs Area */}
                <div className="flex-1 space-y-3 pt-1">
                    {/* Document Number Input */}
                    {doc.hasNumber && (
                        <div className="relative group/input">
                            <input
                                type="text"
                                placeholder={doc.placeholder || 'Enter Document ID Number'}
                                value={formData.kyc_numbers[doc.id] || (legacyId ? formData.kyc_numbers[legacyId] : '') || ''}
                                disabled={docStatus === 'approved'}
                                onChange={(e) => setFormData((prev: any) => {
                                    const next = {
                                        ...prev,
                                        kyc_numbers: { ...(prev.kyc_numbers || {}), [String(doc.id)]: e.target.value }
                                    };
                                    if (legacyId) {
                                        next.kyc_numbers[legacyId] = e.target.value;
                                    }
                                    return next;
                                })}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold focus:ring-2 focus:ring-[#052326]/20 focus:border-[#052326] focus:bg-white transition-all uppercase placeholder:normal-case disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                <Tag size={14} className="text-gray-400" />
                            </div>
                        </div>
                    )}

                    {/* File Action Area */}
                    <div className="flex items-center justify-between gap-3 p-1">
                        {!isUploaded ? (
                            <div className="relative w-full">
                                <input
                                    type="file"
                                    id={`file-${doc.id}`}
                                    accept=".pdf,image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 2 * 1024 * 1024) {
                                                showToast('File size must be less than 2MB', 'error');
                                                e.target.value = '';
                                                return;
                                            }
                                            setFiles(prev => {
                                                const next = { ...prev, [doc.id]: file };
                                                if (legacyId) {
                                                    next[legacyId] = file;
                                                }
                                                return next;
                                            });
                                        }
                                    }}
                                    className="hidden"
                                />
                                <label
                                    htmlFor={`file-${doc.id}`}
                                    className="flex items-center justify-between w-full h-11 px-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-[#052326] hover:shadow-md transition-all group/upload"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center group-hover/upload:bg-[#052326]/5 transition-colors shrink-0">
                                            <Upload size={14} className="text-gray-400 group-hover/upload:text-[#052326]" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 group-hover/upload:text-gray-700 truncate">Choose file...</span>
                                    </div>
                                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wider group-hover/upload:bg-gray-900 group-hover/upload:text-white transition-all shrink-0 whitespace-nowrap">
                                        Browse
                                    </span>
                                </label>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3 w-full h-11 pl-2 pr-2 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex-1 min-w-0 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                                        <FileText size={14} />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-[10px] font-bold text-gray-900 truncate">
                                            {file ? file.name : 'Document Uploaded'}
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : (serverPath ? 'Synced to Cloud' : 'Ready to Save')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {isOnServer && (
                                        <a
                                            href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace('/api', '')}/storage/${serverPath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#052326] transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                                            title="View Document"
                                        >
                                            <ArrowRight size={14} />
                                        </a>
                                    )}
                                    {docStatus !== 'approved' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFiles(prev => {
                                                    const newFiles = { ...prev };
                                                    delete newFiles[doc.id];
                                                    if (legacyId) {
                                                        delete newFiles[legacyId];
                                                    }
                                                    return newFiles;
                                                });
                                                if (savedDocs[doc.id] || (legacyId && savedDocs[legacyId])) {
                                                    setSavedDocs(prev => {
                                                        const newSavedDocs = { ...prev };
                                                        delete newSavedDocs[doc.id];
                                                        if (legacyId) {
                                                            delete newSavedDocs[legacyId];
                                                        }
                                                        return newSavedDocs;
                                                    });
                                                    showToast('Document removed. Click Save Progress to apply.', 'info');
                                                }
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                            title="Remove File"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Progress Bar */}
                    {progress !== undefined && progress > 0 && progress < 100 && (
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#052326] transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import SellerTermsModal from './SellerTermsModal';

export default function SellerRegisterPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [categories, setCategories] = useState<string[]>([]);
    const [concerns, setConcerns] = useState<string[]>([]);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch masters
                const [cats, cons] = await Promise.all([
                    api.get('/categories?type=category'),
                    api.get('/categories?type=concern')
                ]);
                setCategories(cats.data.map((c: any) => c.name));
                setConcerns(cons.data.map((c: any) => c.name));

                // If token exists, fetch current profile progress
                const token = localStorage.getItem('token');
                if (token) {
                    console.log("[DEBUG] Token found, fetching user profile...");
                    const response = await api.get('/user');
                    console.log("[DEBUG] User API Response:", response.data);

                    if (response.data.seller_profile) {
                        const sellerProf = response.data.seller_profile;
                        console.log("[DEBUG] Seller Profile found:", sellerProf);
                        console.log("[DEBUG] KYC Docs from DB:", sellerProf.kyc_docs);

                        setProfile(sellerProf);
                        setSavedDocs(sellerProf.kyc_docs || {});

                        const dbLicenses = sellerProf.selected_licenses || [];
                        const normalized = dbLicenses.map((l: string) => {
                            if (l === 'AYUSH') return 'AYUSH License';
                            if (l === 'FSSAI') return 'FSSAI License';
                            if (l === 'Drug') return 'Drug License';
                            return l;
                        });

                        // Auto-detect any licenses that already have uploaded documents or numbers
                        const kycDocs = sellerProf.kyc_docs || {};
                        const kycNums = sellerProf.kyc_numbers || {};
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

                        // Populate form with saved data from SERVER (Source of Truth)
                        setFormData((prev: any) => ({
                            ...prev,
                            // Merge profile data
                            company_type: sellerProf.company_type || prev.company_type,
                            business_name: sellerProf.business_name || prev.business_name,
                            business_description: sellerProf.business_description || prev.business_description,
                            gst_number: sellerProf.gst_number || prev.gst_number,
                            pan_number: sellerProf.pan_number || prev.pan_number,
                            website: sellerProf.website || prev.website,
                            selected_licenses: normalized,
                            kyc_numbers: sellerProf.kyc_numbers || prev.kyc_numbers || {},

                            // Bank Details
                            bank_name: sellerProf.bank_name || prev.bank_name,
                            branch_name: sellerProf.branch_name || prev.branch_name,
                            bank_account_number: sellerProf.bank_account_number || prev.bank_account_number,
                            ifsc_code: sellerProf.ifsc_code || prev.ifsc_code,
                            account_holder_name: sellerProf.account_holder_name || prev.account_holder_name,

                            // Identity & General Info
                            contact_person: sellerProf.contact_person || prev.contact_person,
                            registering_as: sellerProf.registering_as || prev.registering_as,

                            // Address
                            address_line_1: sellerProf.address_line_1 || prev.address_line_1,
                            address_line_2: sellerProf.address_line_2 || prev.address_line_2,
                            city: sellerProf.city || prev.city,
                            state: sellerProf.state || prev.state,
                            pin_code: sellerProf.pin_code || prev.pin_code,
                            country: sellerProf.country || prev.country || 'India',

                            // Details Section (Business)
                            sourcing_method: sellerProf.sourcing_method || prev.sourcing_method,
                            sell_on_other_platforms: sellerProf.sell_on_other_platforms !== undefined ? (sellerProf.sell_on_other_platforms === true || sellerProf.sell_on_other_platforms === 1 || sellerProf.sell_on_other_platforms === 'Yes' ? 'Yes' : 'No') : prev.sell_on_other_platforms,
                            brand_started_on: sellerProf.brand_started_on ? (typeof sellerProf.brand_started_on === 'string' ? sellerProf.brand_started_on.substring(0, 10) : sellerProf.brand_started_on) : prev.brand_started_on,
                            annual_turnover: sellerProf.annual_turnover || prev.annual_turnover,
                            has_website: sellerProf.has_website !== undefined ? (sellerProf.has_website === true || sellerProf.has_website === 1 || sellerProf.has_website === 'Yes' ? 'Yes' : 'No') : prev.has_website,
                            website_url: sellerProf.website_url || sellerProf.website || prev.website_url,
                            product_count: sellerProf.product_count || prev.product_count,
                            product_categories: sellerProf.product_categories || prev.product_categories || [],
                            concerns_catered: sellerProf.concerns_catered || prev.concerns_catered || [],
                            found_us_via: sellerProf.found_us_via || prev.found_us_via,
                        }));

                        // If profile exists, assume Step 1 & 2 are done
                        if (sellerProf.status === 'incomplete' || sellerProf.status === 'pending') {
                            setCurrentStep(3);
                            // Pre-fill Step 1 data from User object to show context
                            setFormData((prev: any) => ({
                                ...prev,
                                name: response.data.name,
                                email: response.data.email,
                                mobile_number: response.data.phone || response.data.mobile_number,
                                // Mask password to avoid validation errors on back-step
                                password: '********',
                                confirm_password: '********',
                            }));
                            setVerification(prev => ({ ...prev, emailVerified: true, mobileVerified: true }));
                        }
                    } else {
                        console.log("[DEBUG] No seller_profile in response");
                    }
                }
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        fetchUserData();

        // Load saved progress from localStorage (for draft fields not yet on server)
        const savedData = localStorage.getItem('seller_registration_data');
        const savedStep = localStorage.getItem('seller_registration_step');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) { console.error("Failed to parse saved data", e); }
        }
        if (savedStep) {
            setCurrentStep(parseInt(savedStep));
        }
    }, []);
    // Save progress on change
    const [formData, setFormData] = useState({
        // 1. Identity
        name: '',
        contact_person: '',
        email: '',
        mobile_number: '',
        password: '',
        confirm_password: '',
        registering_as: 'Brand' as 'Brand' | 'Manufacturer' | 'Wholesale' | 'Reseller',
        organization_type: 'Brand', // Deprecated, keep for safety or migration
        company_type: '' as 'Sole Proprietorship' | 'Partnership Firm' | 'Private Limited Company' | 'LLP' | '',

        // 2. Address
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        country: 'India',
        pin_code: '',

        // 3. Details Section (Business)
        sourcing_method: '',
        sell_on_other_platforms: 'No',
        brand_started_on: '',
        annual_turnover: '',
        has_website: 'No',
        website_url: '',
        product_count: '',
        product_categories: [] as string[],
        concerns_catered: [] as string[],
        found_us_via: 'Instagram',

        // 4. Bank Details
        bank_name: '',
        branch_name: '',
        bank_account_number: '',
        ifsc_code: '',
        account_holder_name: '',

        // Tax & Bank (Used in Step 2 or later)
        kyc_numbers: {} as Record<string, string>,
        selected_licenses: [] as string[],
        agree_terms: false,
    });

    // Save progress on change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('seller_registration_data', JSON.stringify(formData));
            localStorage.setItem('seller_registration_step', currentStep.toString());
        }
    }, [formData, currentStep]);

    // Scroll to top when changing steps
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const container = document.getElementById('registration-form');
            if (container) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, [currentStep]);

    const [files, setFiles] = useState<Record<string, File | null>>({});
    const [savedDocs, setSavedDocs] = useState<Record<string, string>>({});
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [verification, setVerification] = useState({
        emailOtp: '',
        mobileOtp: '',
        emailVerified: false,
        mobileVerified: false,
        emailSending: false,
        mobileSending: false,
        emailDevOtp: '',
        mobileDevOtp: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        // Clear specific validation error when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cheque' | 'signature') => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
            // Clear file errors
            if (validationErrors[`${type}_image`]) {
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`${type}_image`];
                    return newErrors;
                });
            }
        }
    };

    const handleMultiSelect = (name: string, value: string) => {
        setFormData(prev => {
            const current = (prev as any)[name] as string[];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter(i => i !== value) };
            }
            return { ...prev, [name]: [...current, value] };
        });
    };

    const nextStep = async () => {
        if (currentStep === 1) {
            // Validation for Step 1
            if (!formData.name || !formData.email || !formData.mobile_number || !formData.password) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            if (formData.password !== formData.confirm_password) {
                showToast('Passwords do not match', 'error');
                return;
            }

            // Automatically trigger OTP send when moving to Step 2
            setCurrentStep(2);
            sendOtp('email');
            sendOtp('phone');
        } else if (currentStep === 2) {
            if (!verification.emailVerified || !verification.mobileVerified) {
                showToast('Please verify both Email and Mobile Number', 'error');
                return;
            }

            // Call pre-registration to create the account early
            try {
                const response = await api.post('/pre-register-seller', {
                    name: formData.name,
                    email: formData.email,
                    mobile_number: formData.mobile_number,
                    password: formData.password,
                    organization_type: formData.organization_type,
                    registering_as: formData.registering_as
                });

                // Auto-login the user with the token
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                    // We also need to fetch the initial profile data to set up state correctly
                    // especially if the backend created a skeleton profile
                    const userResponse = await api.get('/user');
                    if (userResponse.data.seller_profile) {
                        const profile = userResponse.data.seller_profile;
                        setSavedDocs(profile.kyc_docs || {});
                        setFormData(prev => ({
                            ...prev,
                            kyc_numbers: profile.kyc_numbers || prev.kyc_numbers
                        }));
                    }
                }

            } catch (err: any) {
                // If it's just a duplicate email error, they might be resuming. 
                // Since OTP is verified, we allow them to proceed.
                if (err.response?.status !== 422) {
                    showToast(err.response?.data?.message || 'Failed to initialize account', 'error');
                    return;
                }
            }

            setCurrentStep(3); // Move to KYC
        } else if (currentStep === 3) {
            if (isKycComplete()) {
                handleSubmitForm();
            } else {
                showToast('Please upload all mandatory documents to finalize registration', 'error');
            }
        }
    };

    const sendOtp = async (type: 'email' | 'phone') => {
        const loginId = type === 'email' ? formData.email : formData.mobile_number;
        const stateKey = type === 'email' ? 'emailSending' : 'mobileSending';

        setVerification(prev => ({ ...prev, [stateKey]: true }));
        try {
            const response = await api.post('/auth/send-otp', {
                login_id: loginId,
                purpose: 'registration'
            });
            if (response.data.dev_otp) {
                setVerification(prev => ({
                    ...prev,
                    [type === 'email' ? 'emailDevOtp' : 'mobileDevOtp']: response.data.dev_otp
                }));
            }
            showToast(`OTP sent to your ${type}`, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to send OTP', 'error');
        } finally {
            setVerification(prev => ({ ...prev, [stateKey]: false }));
        }
    };

    const verifyOtp = async (type: 'email' | 'phone') => {
        const loginId = type === 'email' ? formData.email : formData.mobile_number;
        const otp = type === 'email' ? verification.emailOtp : verification.mobileOtp;
        const verifyKey = type === 'email' ? 'emailVerified' : 'mobileVerified';

        if (otp.length !== 4) {
            showToast('Enter a valid 4-digit OTP', 'error');
            return;
        }

        try {
            await api.post('/auth/verify-otp', { login_id: loginId, otp });
            setVerification(prev => ({ ...prev, [verifyKey]: true }));
            showToast(`${type === 'email' ? 'Email' : 'Mobile'} verified successfully`, 'success');
        } catch (err: any) {
            showToast('Invalid OTP. Please try again.', 'error');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    const isKycComplete = () => {
        const requiredDocs = getRequiredDocs().filter(d => d.required);
        // Check if all required files are present (either locally or on server)
        const allFilesUploaded = requiredDocs.every(d => {
            const legacyId = getLegacyKey(d.id);
            return !!files[d.id] || !!savedDocs[d.id] || (legacyId && (!!files[legacyId] || !!savedDocs[legacyId]));
        });

        // Check if all required numbers are present
        const allNumbersFilled = requiredDocs
            .filter(d => d.hasNumber)
            .every(d => {
                const legacyId = getLegacyKey(d.id);
                return !!formData.kyc_numbers[d.id] || (legacyId && !!formData.kyc_numbers[legacyId]);
            });

        // Check Bank Details
        const bankDetailsFilled = !!formData.bank_name &&
            !!formData.bank_account_number &&
            !!formData.ifsc_code &&
            !!formData.branch_name &&
            !!formData.account_holder_name;

        // Check Business & Address Details
        const addressFilled = !!formData.address_line_1 &&
            !!formData.city &&
            !!formData.state &&
            !!formData.pin_code &&
            !!formData.country;

        const businessFilled = !!formData.annual_turnover &&
            !!formData.sourcing_method &&
            !!formData.sell_on_other_platforms &&
            !!formData.has_website &&
            (formData.has_website === 'Yes' ? !!formData.website_url : true);

        // Check License Selection (Mandatory)
        const licensesSelected = formData.selected_licenses && formData.selected_licenses.length > 0;

        // Check Company Type selection (Mandatory)
        const companyTypeSelected = !!formData.company_type;

        return allFilesUploaded && allNumbersFilled && bankDetailsFilled && addressFilled && businessFilled && licensesSelected && companyTypeSelected;
    };

    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        try {
            const data = new FormData();

            // Map PAN/GST to top-level for backend validation consistency
            const panTypes = ['proprietor_pan', 'firm_pan', 'company_pan'];
            const panId = panTypes.find(id => !!formData.kyc_numbers[id]);
            if (panId) data.append('pan_number', formData.kyc_numbers[panId]);
            if (formData.kyc_numbers.gst_cert) data.append('gst_number', formData.kyc_numbers.gst_cert);
            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    data.append(key, JSON.stringify(value));
                } else if (key === 'kyc_numbers') {
                    Object.entries(formData.kyc_numbers).forEach(([kycKey, kycVal]) => {
                        if (kycVal) data.append(`kyc_numbers[${kycKey}]`, kycVal);
                    });
                } else {
                    data.append(key, String(value));
                }
            });

            Object.entries(files).forEach(([key, file]) => {
                if (file) {
                    if (key === 'cheque' || key === 'signature') {
                        data.append(`${key}_image`, file);
                    } else {
                        data.append(`kyc_docs[${key}]`, file);
                    }
                }
            });

            data.append('existing_kyc_docs', JSON.stringify(savedDocs));
 
            const response = await api.post('/save-draft-seller', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.profile?.kyc_docs) {
                setSavedDocs(response.data.profile.kyc_docs);
            }
            if (response.data.profile?.kyc_numbers) {
                setFormData(prev => ({ ...prev, kyc_numbers: response.data.profile.kyc_numbers }));
            }

            showToast('Progress saved successfully', 'success');
        } catch (err: any) {
            console.error("Save draft error:", err);
            if (err.response?.status === 413) {
                showToast('Save failed: Uploaded files are too large for the server. Please compress your files or select smaller ones.', 'error');
            } else {
                showToast('Failed to save progress', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitForm = async () => {
        setError('');
        setValidationErrors({});
        setIsSubmitting(true);

        if (!formData.agree_terms) {
            setError('You must agree to the terms and conditions');
            setIsSubmitting(false);
            return;
        }

        try {
            const data = new FormData();

            // Map PAN/GST to top-level for backend validation
            const panTypes = ['proprietor_pan', 'firm_pan', 'company_pan'];
            const panId = panTypes.find(id => !!formData.kyc_numbers[id]);
            if (panId) data.append('pan_number', formData.kyc_numbers[panId]);
            if (formData.kyc_numbers.gst_cert) data.append('gst_number', formData.kyc_numbers.gst_cert);

            // Append form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    data.append(key, JSON.stringify(value));
                } else if (key === 'kyc_numbers') {
                    // Handle kyc_numbers separately as it's an object
                    Object.entries(formData.kyc_numbers).forEach(([kycKey, kycVal]) => {
                        if (kycVal) data.append(`kyc_numbers[${kycKey}]`, kycVal);
                    });
                } else {
                    data.append(key, String(value));
                }
            });

            // Append files with correct keys for backend
            Object.entries(files).forEach(([key, file]) => {
                if (file) {
                    if (key === 'cheque' || key === 'signature') {
                        data.append(`${key}_image`, file);
                    } else {
                        // Dynamic KYC documents should be in kyc_docs array for backend processor
                        data.append(`kyc_docs[${key}]`, file);
                    }
                }
            });

            data.append('existing_kyc_docs', JSON.stringify(savedDocs));
 
            const response = await api.post('/register-seller', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

            setSuccess(true);
            showToast('Registration successful!', 'success');
            // Removed auto-redirect. User will see Success UI defined below.

        } catch (err: any) {
            console.error("Submission error:", err);
            if (err.response?.status === 413) {
                setError('Registration failed: Uploaded files are too large for the server. Please compress your files or select smaller ones.');
                showToast('Registration failed: Payload too large', 'error');
            } else if (err.response?.status === 422) {
                setValidationErrors(err.response.data.errors || {});
                showToast(err.response.data.message || 'Validation failed. Please check Step 3.', 'error');
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
                showToast('Registration failed', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        nextStep();
    };

    const getCommonDocs = () => {
        const docs = [
            { id: 'gst_cert', label: 'GST Certificate (If applicable)', required: false, hasNumber: true, placeholder: 'Enter GSTIN' },
            { id: 'udyam', label: 'Udyam Registration Certificate (Optional)', required: false, hasNumber: true, placeholder: 'Enter Udyam Number' },
            { id: 'startup_india', label: 'Startup India Certificate (Optional)', required: false, hasNumber: true, placeholder: 'Enter Startup ID' },
            { id: 'bank_proof', label: 'Bank Account Proof (Mandatory: Cancelled Cheque / Statement)', required: true },
            { id: 'address_proof', label: 'Address Proof (Optional: Electricity Bill / Rent / Property)', required: false },
        ];

        // Add selected licenses
        formData.selected_licenses.forEach(license => {
            if (license !== 'Upload Later') {
                const cleanName = license.replace(/\s*license\s*$/i, '').trim();
                let sanitizedIdPart = license.toLowerCase().replace(/ /g, '_').replace(/\//g, '');
                if (!sanitizedIdPart.endsWith('_license') && (sanitizedIdPart === 'ayush' || sanitizedIdPart === 'fssai' || sanitizedIdPart === 'drug')) {
                    sanitizedIdPart = `${sanitizedIdPart}_license`;
                }
                docs.push({
                    id: `license_${sanitizedIdPart}`, // Sanitize ID for licenses
                    label: `${cleanName} License`,
                    required: true,
                    hasNumber: true,
                    placeholder: `Enter ${cleanName} Number`
                });
            }
        });

        return docs;
    };

    const getSpecificDocs = () => {
        const type = formData.company_type;
        if (!type) return [];

        if (type === 'Sole Proprietorship') {
            return [
                { id: 'proprietor_pan', label: 'Proprietor PAN (Personal PAN - Mandatory)', required: true, hasNumber: true, placeholder: 'Enter PAN Number' },
                { id: 'proprietor_aadhaar', label: 'Aadhaar + Address Proof of Proprietor', required: true, hasNumber: true, placeholder: 'Enter Aadhaar Number' }
            ];
        } else if (type === 'Partnership Firm') {
            return [
                { id: 'partnership_deed', label: 'Partnership Deed', required: true },
                { id: 'firm_pan', label: 'Firm PAN Card', required: true, hasNumber: true, placeholder: 'Enter Firm PAN' },
                { id: 'auth_letter', label: 'Authorization Letter', required: true },
                { id: 'signatory_pan', label: 'Authorized Signatory PAN', required: true, hasNumber: true, placeholder: 'Enter PAN' },
                { id: 'signatory_aadhaar', label: 'Authorized Signatory Aadhaar', required: true, hasNumber: true, placeholder: 'Enter Aadhaar' },
                { id: 'signatory_photo', label: 'Authorized Signatory Photograph', required: true },
                { id: 'signatory_signature', label: 'Authorized Signatory Signature', required: true }
            ];
        } else if (type === 'Private Limited Company') {
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
        } else if (type === 'LLP') {
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

    const getRequiredDocs = () => {
        // This function is still used for submission tracking potentially
        return [...getCommonDocs(), ...getSpecificDocs()];
    };


    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="max-w-xl w-full bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 p-12 text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                    <div className="relative">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 animate-in zoom-in duration-500">
                            <CheckCircle size={48} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Application Submitted!</h2>
                        <p className="text-gray-500 font-medium text-sm max-w-sm mx-auto leading-relaxed">
                            Your seller account has been created and is currently <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Under Review</span>.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info size={14} className="text-emerald-600" /> What happens next?
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Document Verification</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Our team will verify your GST and KYC documents within 24-48 hours.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Dashboard Access</p>
                                    <p className="text-xs text-gray-500 mt-0.5">You can access your dashboard immediately to explore features, though listing products may be restricted.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={() => window.location.href = '/seller/dashboard'}
                            className="w-full h-14 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 hover:shadow-emerald-200 flex items-center justify-center gap-2 group"
                        >
                            Go to Seller Dashboard
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const STEPS = [
        { id: 1, name: "Identity", icon: User },
        { id: 2, name: "Verification", icon: ShieldCheck },
        { id: 3, name: "Company Details & KYC Documents", icon: Upload }
    ];

    return (
        <div className="min-h-screen w-full bg-[#F8F3EF] flex flex-col text-[#052326] font-sans justify-between">
            {/* 1. Top Bar */}


            <div className="flex-1 flex flex-col lg:flex-row lg:min-h-0">
                {/* Left Side - Hero / Marketing */}
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
                                <Store size={10} className="animate-pulse" />
                                Merchant Network
                            </span>
                            <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[#F8F3EF]">
                                Grow Your<br />
                                Wellness Business.
                            </h1>
                            <p className="text-sm xl:text-base text-[#F8F3EF]/80 font-medium leading-relaxed max-w-md">
                                Join our curated premium network of sellers reaching millions of health-conscious customers across India.
                            </p>
                        </div>

                        <div className="mt-16 space-y-5">
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <Store size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Direct Customer Access & Brand Pages</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Unified Insights & Logistics Support</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-[#F8F3EF]/50 font-bold uppercase tracking-widest space-y-2">
                        <div>© 2026 Cureza Wellness. Merchant Portal.</div>
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

                    {/* Big decorative background icon */}
                    <div className="absolute right-[-10%] bottom-[-5%] opacity-[0.03] pointer-events-none">
                        <Store size={350} />
                    </div>
                </div>

                {/* Right Side: Multi-Step Form */}
                <div className="w-full lg:w-[55%] flex flex-col min-h-screen bg-[#F8F3EF] relative">
                    {/* Stepper for Mobile (Small) */}
                    <div className="lg:hidden px-4 md:px-8 pt-8 flex items-center justify-between">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center gap-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= step.id ? 'bg-[#052326] text-white shadow-sm shadow-[#052326]/20' : 'bg-gray-100 text-gray-400'}`}>
                                    {currentStep > step.id ? <Check size={12} strokeWidth={3} /> : step.id}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-tighter ${currentStep >= step.id ? 'text-gray-950' : 'text-gray-300'}`}>{step.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stepper for Desktop (Inline) */}
                    <div className="hidden lg:flex px-12 pt-12 pb-6 border-b border-gray-50 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#052326]/10 text-[#052326] flex items-center justify-center">
                                {currentStep === 1 && <User size={20} />}
                                {currentStep === 2 && <ShieldCheck size={20} />}
                                {currentStep === 3 && <Upload size={20} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-[#052326] uppercase tracking-[0.2em]">Step {currentStep} of 3</p>
                                <h2 className="text-xl font-bold text-gray-950 tracking-tight">{STEPS[currentStep - 1].name}</h2>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {STEPS.map((s) => (
                                <div key={s.id} className={`w-8 h-1 rounded-full ${currentStep >= s.id ? 'bg-[#052326] shadow-[0_0_8px_rgba(5,35,38,0.3)]' : 'bg-gray-100'} transition-all duration-500`} />
                            ))}
                        </div>
                    </div>

                    <main id="registration-form" className="flex-1 overflow-y-auto px-6 py-8 lg:px-12 lg:py-16">
                        <div className="max-w-2xl mx-auto">
                            {error && (
                                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-900 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <div className="text-xs font-semibold">{error}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {currentStep === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {/* 1.1 Identity */}
                                        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 size={16} className="text-[#052326]" />
                                                <h3 className="text-sm font-bold text-gray-900">Business Identity</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputField label="Business Name" name="name" required placeholder="Legal Entity Name" value={formData.name} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <InputField label="Contact Person" name="contact_person" placeholder="Full Name" value={formData.contact_person} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <InputField label="Email Address" name="email" type="email" required placeholder="name@company.com" value={formData.email} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <InputField label="Mobile Number" name="mobile_number" type="tel" required placeholder="+91 98765 43210" value={formData.mobile_number} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <InputField label="Password" name="password" type="password" required value={formData.password} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <InputField label="Confirm Password" name="confirm_password" type="password" required value={formData.confirm_password} onChange={handleInputChange} validationErrors={validationErrors} />
                                            </div>
                                            <div className="space-y-1.5 pt-2">
                                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Organization Type *</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {['Brand', 'Manufacturer', 'Wholesale', 'Reseller'].map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, registering_as: type as any, organization_type: type }))}
                                                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all ${formData.registering_as === type
                                                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 1.2 Address */}
                                        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin size={16} className="text-[#052326]" />
                                                <h3 className="text-sm font-bold text-gray-900">Address Details</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputField
                                                    label="Operational Address Line 1"
                                                    name="address_line_1"
                                                    required
                                                    value={formData.address_line_1}
                                                    onChange={handleInputChange}
                                                    validationErrors={validationErrors}
                                                    placeholder="Street, Building, Unit"
                                                />
                                                <InputField
                                                    label="Operational Address Line 2"
                                                    name="address_line_2"
                                                    value={formData.address_line_2}
                                                    onChange={handleInputChange}
                                                    validationErrors={validationErrors}
                                                    placeholder="Area, Landmark"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                <InputField label="City" name="city" required value={formData.city} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <SelectField label="State" name="state" required options={["Select State", ...Object.keys(indianLocations)]} value={formData.state} onChange={handleInputChange} />
                                                <InputField label="Country" name="country" required value={formData.country} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <InputField label="Pincode" name="pin_code" required value={formData.pin_code} onChange={handleInputChange} validationErrors={validationErrors} />
                                            </div>
                                        </div>

                                        {/* 1.3 Business Details */}
                                        <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm space-y-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info size={16} className="text-[#052326]" />
                                                <h3 className="text-sm font-bold text-gray-900">Additional Details</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <SelectField label="Sourcing Method *" name="sourcing_method" options={SOURCING_METHODS} value={formData.sourcing_method} onChange={handleInputChange} />
                                                <SelectField label="Sell on other platforms? *" name="sell_on_other_platforms" options={["No", "Yes"]} value={formData.sell_on_other_platforms} onChange={handleInputChange} />
                                                <InputField label="Brand Started On *" name="brand_started_on" type="number" placeholder="YYYY" value={formData.brand_started_on} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <SelectField label="Annual Turnover *" name="annual_turnover" options={TURNOVER_RANGES} value={formData.annual_turnover} onChange={handleInputChange} />
                                                <div className="md:col-span-2">
                                                    <SelectField label="Do you have a website? *" name="has_website" options={["No", "Yes"]} value={formData.has_website} onChange={handleInputChange} />
                                                    {formData.has_website === "Yes" && (
                                                        <InputField label="Website URL" name="website_url" placeholder="https://..." value={formData.website_url} onChange={handleInputChange} validationErrors={validationErrors} className="mt-2" />
                                                    )}
                                                </div>
                                                <InputField label="Number of Products" name="product_count" type="number" value={formData.product_count} onChange={handleInputChange} validationErrors={validationErrors} />
                                                <SelectField label="How did you hear about us?" name="found_us_via" options={REFERRAL_SOURCES} value={formData.found_us_via} onChange={handleInputChange} />
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                                                <MultiSelectField label="Product Categories" name="product_categories" options={categories.length > 0 ? categories : []} selectedValues={formData.product_categories} onToggle={handleMultiSelect} />
                                                <MultiSelectField label="Concerns you cater to" name="concerns_catered" options={concerns.length > 0 ? concerns : []} selectedValues={formData.concerns_catered} onToggle={handleMultiSelect} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-xl mx-auto py-4">
                                        <div className="text-center space-y-2 mb-8">
                                            <div className="w-12 h-12 bg-[#052326]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <ShieldCheck size={24} className="text-[#052326]" />
                                            </div>
                                            <h3 className="text-lg font-bold">Verification Required</h3>
                                            <p className="text-xs text-gray-500">We've sent 4-digit codes to your email and mobile number. Please enter them below to proceed.</p>
                                        </div>

                                        {/* Email Verification */}
                                        <div className={`p-6 rounded-xl border-2 transition-all ${verification.emailVerified ? 'bg-[#052326]/5 border-[#052326]/20' : 'bg-white border-gray-200 shadow-sm'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${verification.emailVerified ? 'bg-[#052326]/10 text-[#052326]' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Mail size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">Email Address</p>
                                                        <p className="text-[10px] text-gray-500">{formData.email}</p>
                                                    </div>
                                                </div>
                                                {verification.emailVerified && <span className="text-[10px] font-bold text-[#052326] bg-[#052326]/10 px-2 py-0.5 rounded-full uppercase">Verified</span>}
                                            </div>

                                            {!verification.emailVerified && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            maxLength={4}
                                                            placeholder="Enter OTP"
                                                            value={verification.emailOtp}
                                                            onChange={(e) => setVerification(prev => ({ ...prev, emailOtp: e.target.value }))}
                                                            className="flex-1 h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-950 tracking-[0.5em] text-center font-bold"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => verifyOtp('email')}
                                                            className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-[11px] font-bold hover:bg-gray-800"
                                                        >
                                                            Verify
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={verification.emailSending}
                                                            onClick={() => sendOtp('email')}
                                                            className="px-3 py-1.5 border border-gray-200 rounded-md text-[11px] font-bold hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            {verification.emailSending ? <Loader2 size={12} className="animate-spin" /> : 'Resend'}
                                                        </button>
                                                    </div>
                                                    {verification.emailDevOtp && (
                                                        <div className="text-[10px] font-mono text-blue-600 bg-blue-50/50 p-2 rounded-lg text-center border border-blue-100 animate-in fade-in zoom-in duration-300">
                                                            <span className="font-bold">Dev Mode:</span> Your OTP is <span className="text-[14px] font-extrabold tracking-widest ml-1">{verification.emailDevOtp}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Mobile Verification */}
                                        <div className={`p-6 rounded-xl border-2 transition-all ${verification.mobileVerified ? 'bg-[#052326]/5 border-[#052326]/20' : 'bg-white border-gray-200 shadow-sm'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${verification.mobileVerified ? 'bg-[#052326]/10 text-[#052326]' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Phone size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">Mobile Number</p>
                                                        <p className="text-[10px] text-gray-500">{formData.mobile_number}</p>
                                                    </div>
                                                </div>
                                                {verification.mobileVerified && <span className="text-[10px] font-bold text-[#052326] bg-[#052326]/10 px-2 py-0.5 rounded-full uppercase">Verified</span>}
                                            </div>

                                            {!verification.mobileVerified && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            maxLength={4}
                                                            placeholder="Enter OTP"
                                                            value={verification.mobileOtp}
                                                            onChange={(e) => setVerification(prev => ({ ...prev, mobileOtp: e.target.value }))}
                                                            className="flex-1 h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-950 tracking-[0.5em] text-center font-bold"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => verifyOtp('phone')}
                                                            className="px-4 py-1.5 bg-gray-900 text-white rounded-md text-[11px] font-bold hover:bg-gray-800"
                                                        >
                                                            Verify
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={verification.mobileSending}
                                                            onClick={() => sendOtp('phone')}
                                                            className="px-3 py-1.5 border border-gray-200 rounded-md text-[11px] font-bold hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            {verification.mobileSending ? <Loader2 size={12} className="animate-spin" /> : 'Resend'}
                                                        </button>
                                                    </div>
                                                    {verification.mobileDevOtp && (
                                                        <div className="text-[10px] font-mono text-blue-600 bg-blue-50/50 p-2 rounded-lg text-center border border-blue-100 animate-in fade-in zoom-in duration-300">
                                                            <span className="font-bold">Dev Mode:</span> Your OTP is <span className="text-[14px] font-extrabold tracking-widest ml-1">{verification.mobileDevOtp}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-[10px] text-gray-500 leading-relaxed">
                                                <span className="font-bold text-gray-700">Note:</span> In this development environment, you can find the OTP in the backend server logs. Codes are valid for 5 minutes.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-4xl mx-auto py-4 pb-20">
                                        {/* SECTION: ADDRESS & BUSINESS DETAILS */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#052326]/10 rounded-xl flex items-center justify-center text-[#052326]">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Business Address & Info</h3>
                                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Location & Operations</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-5">
                                                {/* Address Block */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <InputField
                                                        label="Address Line 1"
                                                        name="address_line_1"
                                                        value={formData.address_line_1}
                                                        onChange={handleInputChange}
                                                        validationErrors={validationErrors}
                                                        placeholder="Shop No., Building, Street"
                                                        required={true}
                                                        className="md:col-span-2"
                                                    />
                                                    <InputField
                                                        label="Address Line 2"
                                                        name="address_line_2"
                                                        value={formData.address_line_2}
                                                        onChange={handleInputChange}
                                                        validationErrors={validationErrors}
                                                        placeholder="Area, Landmark (Optional)"
                                                    />
                                                    <div className="grid grid-cols-2 gap-5">
                                                        <InputField
                                                            label="Pincode"
                                                            name="pin_code"
                                                            value={formData.pin_code}
                                                            onChange={handleInputChange}
                                                            validationErrors={validationErrors}
                                                            placeholder="6-digit Pincode"
                                                            required={true}
                                                            type="number"
                                                        />
                                                        <InputField
                                                            label="City"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleInputChange}
                                                            validationErrors={validationErrors}
                                                            placeholder="City"
                                                            required={true}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-5">
                                                        <SelectField
                                                            label="State"
                                                            name="state"
                                                            value={formData.state}
                                                            onChange={handleInputChange}
                                                            options={['Select State', ...Object.keys(indianLocations)]}
                                                            required={true}
                                                        />
                                                        <SelectField
                                                            label="Country"
                                                            name="country"
                                                            value={formData.country}
                                                            onChange={handleInputChange}
                                                            options={['India']}
                                                            required={true}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="h-px bg-gray-50 my-4"></div>

                                                {/* Operations Block */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <SelectField
                                                        label="Annual Turnover"
                                                        name="annual_turnover"
                                                        value={formData.annual_turnover}
                                                        onChange={handleInputChange}
                                                        options={['Select Range', ...TURNOVER_RANGES]}
                                                        required={true}
                                                    />
                                                    <SelectField
                                                        label="Sourcing Method"
                                                        name="sourcing_method"
                                                        value={formData.sourcing_method}
                                                        onChange={handleInputChange}
                                                        options={['Select Method', ...SOURCING_METHODS]}
                                                        required={true}
                                                    />
                                                    <div className="space-y-1">
                                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Do you sell on other platforms? *</label>
                                                        <div className="flex gap-4 mt-1">
                                                            {['Yes', 'No'].map(opt => (
                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="sell_on_other_platforms"
                                                                        value={opt}
                                                                        checked={formData.sell_on_other_platforms === opt}
                                                                        onChange={handleInputChange}
                                                                        className="text-[#052326] focus:ring-[#052326]"
                                                                    />
                                                                    <span className="text-xs font-medium text-gray-700">{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Do you have a website? *</label>
                                                        <div className="flex gap-4 mt-1">
                                                            {['Yes', 'No'].map(opt => (
                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="has_website"
                                                                        value={opt}
                                                                        checked={formData.has_website === opt}
                                                                        onChange={handleInputChange}
                                                                        className="text-[#052326] focus:ring-[#052326]"
                                                                    />
                                                                    <span className="text-xs font-medium text-gray-700">{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {formData.has_website === 'Yes' && (
                                                        <InputField
                                                            label="Website URL"
                                                            name="website_url"
                                                            value={formData.website_url}
                                                            onChange={handleInputChange}
                                                            validationErrors={validationErrors}
                                                            placeholder="https://yourbrand.com"
                                                            required={true}
                                                            className="md:col-span-2 animate-in fade-in"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION: BANK DETAILS */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#052326]/10 rounded-xl flex items-center justify-center text-[#052326]">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Bank Details</h3>
                                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">For Payouts & Verification</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-white border border-gray-100 rounded-[10px] space-y-5">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <InputField
                                                        label="Account Holder Name"
                                                        name="account_holder_name"
                                                        value={formData.account_holder_name}
                                                        onChange={handleInputChange}
                                                        validationErrors={validationErrors}
                                                        placeholder="Name as per Bank Records"
                                                        required={true}
                                                    />
                                                    <InputField
                                                        label="Bank Name"
                                                        name="bank_name"
                                                        value={formData.bank_name}
                                                        onChange={handleInputChange}
                                                        validationErrors={validationErrors}
                                                        placeholder="e.g. HDFC Bank"
                                                        required={true}
                                                    />
                                                    <InputField
                                                        label="Account Number"
                                                        name="bank_account_number"
                                                        value={formData.bank_account_number}
                                                        onChange={handleInputChange}
                                                        validationErrors={validationErrors}
                                                        placeholder="Enter Account Number"
                                                        required={true}
                                                    />
                                                    <InputField
                                                        label="IFSC Code"
                                                        name="ifsc_code"
                                                        value={formData.ifsc_code}
                                                        onChange={handleInputChange}
                                                        validationErrors={validationErrors}
                                                        placeholder="e.g. HDFC0001234"
                                                        required={true}
                                                    />
                                                    <InputField
                                                        label="Branch Name"
                                                        name="branch_name"
                                                        value={formData.branch_name}
                                                        onChange={handleInputChange}
                                                        validationErrors={validationErrors}
                                                        placeholder="e.g. Koramangala Branch"
                                                        required={true}
                                                    />
                                                </div>
                                                <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-medium">
                                                    <Info size={14} className="mt-0.5 shrink-0" />
                                                    <p>Please ensure these details match the Cancelled Cheque / Bank Statement uploaded below.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 1: COMMON DOCUMENTS */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#052326]/10 rounded-xl flex items-center justify-center text-[#052326]">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Common Documents</h3>
                                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Required for all sellers</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {getCommonDocs().slice(0, 5).map((doc) => (
                                                    <KYCDocumentRow
                                                        key={doc.id}
                                                        doc={doc}
                                                        files={files}
                                                        savedDocs={savedDocs}
                                                        setSavedDocs={setSavedDocs}
                                                        uploadProgress={uploadProgress}
                                                        formData={formData}
                                                        setFormData={setFormData}
                                                        setFiles={setFiles}
                                                        showToast={showToast}
                                                        profile={profile}
                                                    />
                                                ))}

                                                {/* Product / Regulatory (Conditional Multi-select) */}
                                                <div className="p-6 bg-[#052326]/5 border border-[#052326]/10 rounded-[10px] space-y-5">
                                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                                        <div className="w-10 h-10 bg-[#052326]/10 rounded-[10px] flex items-center justify-center text-[#052326]">
                                                            <ScrollText size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-[#052326] tracking-wide">Product / Regulatory Licenses <span className="text-red-500">*</span></h4>
                                                            <p className="text-[10px] text-gray-600 font-medium">Select available licenses or choose "Upload Later"</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {['Drug License', 'AYUSH License', 'FSSAI License', 'CBD / Hemp NOC', 'COA / Lab Reports'].map(license => (
                                                            <label key={license} className={`flex items-center gap-3 p-3 bg-white border rounded-[10px] cursor-pointer transition-all select-none group ${formData.selected_licenses.includes(license) ? 'border-[#052326] bg-[#052326]/5' : 'border-[#052326]/10 hover:border-[#052326]/30'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.selected_licenses.includes(license)}
                                                                    onChange={() => {
                                                                        let newSelected: string[];
                                                                        // If checking others, verify Upload Later is removed
                                                                        if (formData.selected_licenses.includes(license)) {
                                                                            newSelected = formData.selected_licenses.filter(l => l !== license);
                                                                        } else {
                                                                            newSelected = [...formData.selected_licenses.filter(l => l !== 'Upload Later'), license];
                                                                        }
                                                                        setFormData(prev => ({ ...prev, selected_licenses: newSelected }));
                                                                    }}
                                                                    className="w-4 h-4 rounded border-[#052326]/20 text-[#052326] focus:ring-[#052326]"
                                                                />
                                                                <span className={`text-[11px] font-bold transition-colors ${formData.selected_licenses.includes(license) ? 'text-[#052326]' : 'text-gray-700 group-hover:text-[#052326]'}`}>{license}</span>
                                                            </label>
                                                        ))}
                                                    </div>

                                                    {/* Upload Later Warning Row */}
                                                    <label className={`flex items-start gap-4 p-4 border rounded-[10px] cursor-pointer transition-all select-none group relative ${formData.selected_licenses.includes('Upload Later')
                                                        ? 'bg-[#F0C417]/10 border-[#F0C417]/30'
                                                        : 'bg-white border-dashed border-[#052326]/10 hover:border-[#F0C417] hover:bg-[#F0C417]/5'
                                                        }`}>
                                                        <div className="mt-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.selected_licenses.includes('Upload Later')}
                                                                onChange={() => {
                                                                    const newSelected = formData.selected_licenses.includes('Upload Later')
                                                                        ? []
                                                                        : ['Upload Later'];
                                                                    setFormData(prev => ({ ...prev, selected_licenses: newSelected }));
                                                                }}
                                                                className="w-4 h-4 rounded border-[#F0C417]/30 text-[#052326] focus:ring-[#052326]"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-xs font-bold transition-colors ${formData.selected_licenses.includes('Upload Later') ? 'text-[#052326]' : 'text-gray-700 group-hover:text-[#052326]'}`}>
                                                                    I don't have these documents right now (Upload Later)
                                                                </span>
                                                                {formData.selected_licenses.includes('Upload Later') && (
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F0C417]/20 text-[#052326] rounded-[10px]">
                                                                        Restricted Mode
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                                                <span className="font-bold text-[#F0C417]">Note:</span> Your account will have restricted access until mandatory regulatory documents are verified. You can upload them later from your seller dashboard settings.
                                                            </p>
                                                        </div>
                                                    </label>

                                                    {/* Selected licenses rows */}
                                                    <div className="space-y-4 pt-2">
                                                        {getCommonDocs().slice(5).map((doc) => (
                                                            <KYCDocumentRow
                                                                key={doc.id}
                                                                doc={doc}
                                                                files={files}
                                                                savedDocs={savedDocs}
                                                                setSavedDocs={setSavedDocs}
                                                                uploadProgress={uploadProgress}
                                                                formData={formData}
                                                                setFormData={setFormData}
                                                                setFiles={setFiles}
                                                                showToast={showToast}
                                                                profile={profile}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* VISUAL GAP & HEADING */}
                                        <div className="relative py-12 text-center overflow-hidden">
                                            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 z-0"></div>
                                            <div className="relative z-10 inline-block px-10 bg-gray-50/50">
                                                <h3 className="text-sm font-bold text-gray-500">Documents – Company Specific</h3>
                                            </div>
                                        </div>

                                        {/* SECTION 2: COMPANY TYPE SELECTION */}
                                        <div className="p-8 bg-white border border-gray-100 rounded-[10px] relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#052326]/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-[#052326]/10 opacity-50"></div>

                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-[#052326] rounded-[10px] flex items-center justify-center text-white italic font-black">
                                                    ?
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Select Company Type *</h3>
                                                    <p className="text-xs text-gray-700 font-medium">Choose your legal entity status to unveil required documents</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {['Sole Proprietorship', 'Partnership Firm', 'Private Limited Company', 'LLP'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, company_type: type as any }))}
                                                        className={`px-2 py-4 rounded-[10px] text-[10px] font-bold border transition-all text-center flex items-center justify-center h-full min-h-[60px] ${formData.company_type === type
                                                            ? 'bg-[#052326] text-white border-[#052326] scale-[1.02]'
                                                            : 'bg-white text-gray-500 border-gray-100 hover:border-[#052326] hover:bg-[#052326]/5'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SECTION 3: SPECIFIC DOCUMENTS */}
                                        {formData.company_type ? (
                                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="grid grid-cols-1 gap-4">
                                                    {getSpecificDocs().map((doc) => (
                                                        <KYCDocumentRow
                                                            key={doc.id}
                                                            doc={doc}
                                                            files={files}
                                                            savedDocs={savedDocs}
                                                            setSavedDocs={setSavedDocs}
                                                            uploadProgress={uploadProgress}
                                                            formData={formData}
                                                            setFormData={setFormData}
                                                            setFiles={setFiles}
                                                            showToast={showToast}
                                                            profile={profile}
                                                        />
                                                    ))}
                                                </div>

                                                <div className="mt-12 pt-10 border-t border-gray-100">
                                                    <div className="bg-[#052326] rounded-[10px] p-8 text-white group overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#052326]/90 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                                                        <label className="flex items-start gap-6 cursor-pointer relative z-10">
                                                            <div className="relative flex items-center mt-1">
                                                                <input
                                                                    type="checkbox"
                                                                    name="agree_terms"
                                                                    checked={formData.agree_terms}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setShowTermsModal(true);
                                                                            // Do NOT set checked here; modal will do it
                                                                        } else {
                                                                            handleInputChange(e); // Allow unchecking freely
                                                                        }
                                                                    }}
                                                                    className="peer sr-only"
                                                                />
                                                                <div className="w-6 h-6 border-2 border-white/20 rounded-lg text-white peer-checked:bg-[#F0C417] peer-checked:border-[#F0C417] flex items-center justify-center transition-all group-hover:border-white">
                                                                    <Check size={14} strokeWidth={4} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-[#F8F3EF]/90 leading-relaxed mb-2 text-[11px]">Final Declaration</p>
                                                                <span className="text-xs text-[#F8F3EF]/70 font-medium leading-relaxed">
                                                                    I hereby declare that all information and documents provided are true and correct. I understand that false documentation will lead to immediate portal rejection. I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-white font-bold underline decoration-[#F0C417] underline-offset-4">Seller Policy</button> and <Link href="/terms" className="text-white font-bold underline decoration-[#F0C417] underline-offset-4">Terms of Service</Link>.
                                                                </span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-32 text-center space-y-6 bg-gray-50/50 rounded-[10px] border-4 border-dashed border-gray-100 grayscale opacity-40">
                                                <div className="w-16 h-16 bg-white rounded-[10px] flex items-center justify-center mx-auto text-gray-200">
                                                    <Lock size={32} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-gray-400">Company Documents Locked</p>
                                                    <p className="text-[11px] text-gray-400 font-medium italic">Please select your legal entity status above to continue onboarding</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between pt-10 border-t border-gray-50">
                                    {currentStep > 1 && currentStep !== 3 ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-2 rounded-[10px] border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-950 transition-all"
                                        >
                                            Previous
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    <div className="flex gap-4">
                                        {currentStep === 3 && (
                                            <button
                                                type="button"
                                                onClick={handleSaveDraft}
                                                disabled={isSubmitting}
                                                className="inline-flex h-11 items-center justify-center rounded-[10px] border-2 border-[#052326]/20 bg-[#052326]/5 px-8 text-[11px] font-bold text-[#052326] hover:bg-[#052326]/10 hover:border-[#052326]/30 transition-all disabled:opacity-50 gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                    <>
                                                        <Save size={14} strokeWidth={3} />
                                                        Save Progress
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || (currentStep === 3 && (!isKycComplete() || !formData.agree_terms))}
                                            className={`inline-flex h-11 items-center justify-center rounded-[10px] px-10 text-[11px] font-bold text-white transition-all disabled:opacity-50 gap-2 ${currentStep === 3 && (!isKycComplete() || !formData.agree_terms)
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#052326] hover:bg-[#052326]/90'
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    {currentStep === 3 ? (
                                                        !isKycComplete() ? 'Complete Documents' :
                                                            !formData.agree_terms ? 'Accept Declaration' : 'Finalize Registration'
                                                    ) : 'Save & Continue'}
                                                    <ChevronRight size={14} strokeWidth={3} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="text-center text-xs font-semibold mt-8">
                                <span className="text-gray-500">Already have a seller account? </span>
                                <Link href="/seller/login" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                    Login now
                                </Link>
                            </div>

                            <div className="text-center text-[11px] font-semibold border-t border-gray-100 pt-4 mt-6 flex flex-col gap-2">
                                <div>
                                    <span className="text-gray-400">Are you a customer? </span>
                                    <Link href="/login" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                        Customer Login
                                    </Link>
                                </div>
                                <div>
                                    <span className="text-gray-400">Are you a doctor? </span>
                                    <Link href="/doctor/login" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                        Doctor Portal
                                    </Link>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-2">
                                    <Link href="/" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors text-xs">
                                        Go Back to Home
                                    </Link>
                                </div>
                            </div>
                            <p className="mt-12 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                Secure Registration • 256-bit SSL Encryption
                            </p>
                        </div>
                    </main>
                </div>
            </div>
            {/* Modal */}
            <SellerTermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAgree={() => {
                    setFormData(prev => ({ ...prev, agree_terms: true }));
                    setShowTermsModal(false);
                }}
            />
        </div>
    );
}
