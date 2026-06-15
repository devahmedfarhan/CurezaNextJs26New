'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/common/NotificationBell';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    CreditCard,
    Settings,
    LogOut,
    Store,
    BarChart2,
    Ticket,
    MessageSquare,
    HelpCircle,
    X,
    FileText,
    LifeBuoy,
    ShieldCheck,
    User,
    AlertCircle,
    ArrowRight,
    Menu,
    Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SELLER_LINKS = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
    { name: 'My Products', href: '/seller/dashboard/products', icon: Package },
    { name: 'Orders', href: '/seller/dashboard/orders', icon: ShoppingCart },
    { name: 'Payments', href: '/seller/dashboard/finance', icon: CreditCard },
    { name: 'Analytics', href: '/seller/dashboard/analytics', icon: BarChart2 },
    { name: 'Reviews', href: '/seller/dashboard/reviews', icon: MessageSquare },
    { name: 'Coupons', href: '/seller/dashboard/coupons', icon: Ticket },
    { name: 'Settings', href: '/seller/dashboard/settings', icon: Settings },
    { name: 'Store Profile', href: '/seller/dashboard/profile', icon: Store },
    { name: 'Seller Policy', href: '/seller/dashboard/sellerpolicy', icon: ShieldCheck },
    { name: 'Support', href: '/seller/dashboard/support', icon: LifeBuoy },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [fullProfile, setFullProfile] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const mobileProfileMenuRef = useRef<HTMLDivElement>(null);

    const getBrandName = () => {
        if (user?.brand?.name) return user.brand.name;
        if (fullProfile?.brand?.name) return fullProfile.brand.name;
        if ((user as any)?.seller_profile?.brand_name) return (user as any).seller_profile.brand_name;
        if (fullProfile?.brand_name) return fullProfile.brand_name;
        if ((user as any)?.seller_profile?.company_name) return (user as any).seller_profile.company_name;
        if ((user as any)?.sellerProfile?.brand_name) return (user as any).sellerProfile.brand_name;
        if (user?.name) return user.name;
        return 'Brand';
    };
    const sellerBrandName = getBrandName();
    const dynamicReportTabName = `${sellerBrandName} x Cureza`;
    const brandSlug = user?.brand?.slug || (user as any)?.seller_profile?.brand_name?.toLowerCase().replace(/\s+/g, '-') || 'brand';

    const getBrandLogo = () => {
        const logoPath = user?.brand?.logo || fullProfile?.brand?.logo || (user as any)?.seller_profile?.logo || (user as any)?.sellerProfile?.logo || (user as any)?.brand?.logo;
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return logoPath.startsWith('/') ? `${backend}${logoPath}` : `${backend}/storage/${logoPath}`;
    };
    const brandLogoUrl = getBrandLogo();


    useEffect(() => {
        if (user && (user as any).seller_profile?.status === 'pending') {
            const token = localStorage.getItem('token');
            axios.get(`${API_BASE_URL}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                if (res.data.seller_profile) {
                    setFullProfile(res.data.seller_profile);
                }
            }).catch(err => console.error('Failed to fetch real-time profile', err));
        }
    }, [user]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const isClickInsideDesktop = profileMenuRef.current && profileMenuRef.current.contains(event.target as Node);
            const isClickInsideMobile = mobileProfileMenuRef.current && mobileProfileMenuRef.current.contains(event.target as Node);
            
            if (!isClickInsideDesktop && !isClickInsideMobile) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/seller/login');
            } else if (user.role !== 'vendor') {
                router.push('/unauthorized');
            } else if ((user as any).seller_profile && (user as any).seller_profile.status === 'incomplete') {
                // Keep incomplete redirect, but allow 'pending' to stay on dashboard
                router.push('/seller/register');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    if (!user || user.role !== 'vendor') {
        return null;
    }

    const isPending = (user as any).seller_profile?.status === 'pending';

    if (isPending) {
        const profile = fullProfile || (user as any).seller_profile || {};
        
        const getLegacyKey = (key: string) => {
            if (key === 'license_ayush_license') return 'license_ayush';
            if (key === 'license_fssai_license') return 'license_fssai';
            if (key === 'license_drug_license') return 'license_drug';
            return null;
        };

        // Define dynamic document types based on selected company type
        const companyType = profile.company_type || 'Sole Proprietorship';
        const getDocsList = () => {
            const docs = [
                { id: 'bank_proof', label: 'Bank Cancelled Cheque / Statement' },
                { id: 'gst_cert', label: 'GST Certificate' },
                { id: 'udyam', label: 'Udyam Registration Certificate' },
                { id: 'startup_india', label: 'Startup India Certificate' },
                { id: 'address_proof', label: 'Address Proof' }
            ];
            
            if (companyType === 'Sole Proprietorship') {
                docs.push(
                    { id: 'proprietor_pan', label: 'Proprietor Personal PAN' },
                    { id: 'proprietor_aadhaar', label: 'Proprietor Aadhaar Card' }
                );
            } else if (companyType === 'Partnership Firm') {
                docs.push(
                    { id: 'partnership_deed', label: 'Partnership Deed' },
                    { id: 'firm_pan', label: 'Firm Dedicated PAN Card' },
                    { id: 'auth_letter', label: 'Partner Authorization Letter' },
                    { id: 'signatory_pan', label: 'Signatory PAN Card' },
                    { id: 'signatory_aadhaar', label: 'Signatory Aadhaar Card' },
                    { id: 'signatory_photo', label: 'Signatory Photo Specimen' },
                    { id: 'signatory_signature', label: 'Signatory Signature' }
                );
            } else if (companyType === 'Private Limited Company') {
                docs.push(
                    { id: 'coi', label: 'Certificate of Incorporation (COI)' },
                    { id: 'moa', label: 'MOA Document' },
                    { id: 'aoa', label: 'AOA Document' },
                    { id: 'company_pan', label: 'Company PAN Card' },
                    { id: 'director_pan', label: 'MD PAN Card' },
                    { id: 'director_aadhaar', label: 'MD Aadhaar Card' },
                    { id: 'director_photo', label: 'MD Photograph Specimen' },
                    { id: 'director_signature', label: 'MD Signature Specimen' }
                );
            } else if (companyType === 'LLP') {
                docs.push(
                    { id: 'llp_coi', label: 'LLP Certificate of Incorporation' },
                    { id: 'llp_agreement', label: 'LLP Partnership Agreement' },
                    { id: 'llp_pan', label: 'LLP Dedicated PAN Card' },
                    { id: 'partner_pan_upload', label: 'DP PAN Card' },
                    { id: 'partner_aadhaar_upload', label: 'DP Aadhaar Card' },
                    { id: 'partner_signature', label: 'DP Signature Specimen' },
                    { id: 'auth_letter_llp', label: 'Authorization Letter' }
                );
            }

            // Append active selected licenses (e.g. FSSAI License, drug license etc.)
            const selectedLicenses = profile.selected_licenses || [];
            selectedLicenses.forEach((lic: string) => {
                if (lic !== 'Upload Later') {
                    const cleanName = lic.replace(/\s*license\s*$/i, '').trim();
                    let sanitizedIdPart = lic.toLowerCase().replace(/ /g, '_').replace(/\//g, '');
                    if (!sanitizedIdPart.endsWith('_license') && (sanitizedIdPart === 'ayush' || sanitizedIdPart === 'fssai' || sanitizedIdPart === 'drug')) {
                        sanitizedIdPart = `${sanitizedIdPart}_license`;
                    }
                    const licId = `license_${sanitizedIdPart}`;
                    docs.push({ id: licId, label: `${cleanName} License` });
                }
            });

            // Fallback: If there are ANY other files inside profile.kyc_docs that we haven't listed, append them!
            const listedIds = new Set(docs.map(d => d.id));
            if (profile.kyc_docs) {
                Object.keys(profile.kyc_docs).forEach(k => {
                    let normalizedKey = k;
                    if (k === 'license_ayush') normalizedKey = 'license_ayush_license';
                    if (k === 'license_fssai') normalizedKey = 'license_fssai_license';
                    if (k === 'license_drug') normalizedKey = 'license_drug_license';
                    
                    if (!listedIds.has(normalizedKey)) {
                        const prettyLabel = normalizedKey
                            .replace(/_/g, ' ')
                            .replace('license ', '')
                            .toUpperCase();
                        docs.push({ id: normalizedKey, label: prettyLabel });
                        listedIds.add(normalizedKey);
                    }
                });
            }

            // FILTER DOWN to only show documents that:
            // 1. Are required for this company type OR
            // 2. Have been uploaded (exists in kyc_docs or legacy image path)
            return docs.filter(doc => {
                const legacyId = getLegacyKey(doc.id);
                // Check if uploaded
                let filePath = profile.kyc_docs?.[doc.id] || '';
                if (!filePath && legacyId) {
                    filePath = profile.kyc_docs?.[legacyId] || '';
                }
                if (doc.id === 'bank_proof' && !filePath) {
                    filePath = profile.cheque_image_path || '';
                }
                if (doc.id === 'gst_cert' && !filePath) {
                    filePath = profile.gst_image_path || '';
                }
                if (['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'].includes(doc.id) && !filePath) {
                    filePath = profile.pan_image_path || '';
                }
                if (['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'].includes(doc.id) && !filePath) {
                    filePath = profile.aadhaar_image_path || '';
                }
                if (['signatory_signature', 'director_signature', 'partner_signature'].includes(doc.id) && !filePath) {
                    filePath = profile.signature_image_path || '';
                }
                const hasFile = !!filePath;

                // Check if mandatory/required for the company type (GST cert, udyam etc are common but optional unless uploaded)
                const isMandatoryCommon = doc.id === 'bank_proof'; // Cheque is always mandatory
                const isSpecific = companyType === 'Sole Proprietorship' 
                    ? ['proprietor_pan', 'proprietor_aadhaar'].includes(doc.id)
                    : companyType === 'Partnership Firm'
                        ? ['partnership_deed', 'firm_pan', 'auth_letter', 'signatory_pan', 'signatory_aadhaar', 'signatory_photo', 'signatory_signature'].includes(doc.id)
                        : companyType === 'Private Limited Company'
                            ? ['coi', 'moa', 'aoa', 'company_pan', 'director_pan', 'director_aadhaar', 'director_photo', 'director_signature'].includes(doc.id)
                            : companyType === 'LLP'
                                ? ['llp_coi', 'llp_agreement', 'llp_pan', 'partner_pan_upload', 'partner_aadhaar_upload', 'partner_signature', 'auth_letter_llp'].includes(doc.id)
                                : false;

                const isLicense = doc.id.startsWith('license_');

                return hasFile || isMandatoryCommon || isSpecific || isLicense;
            });
        };

        const activeDocs = getDocsList();

        // Check if ANY standard or dynamic document status is set to rejected
        const isResubmit = profile.resubmit_allowed || 
            profile.pan_status === 'rejected' ||
            profile.gst_status === 'rejected' ||
            profile.cheque_status === 'rejected' ||
            profile.signature_status === 'rejected' ||
            profile.aadhaar_status === 'rejected' ||
            activeDocs.some(d => {
                const legacyId = getLegacyKey(d.id);
                const status = profile[`${d.id}_status`] || profile.kyc_document_statuses?.[d.id] || (legacyId ? (profile[`${legacyId}_status`] || profile.kyc_document_statuses?.[legacyId]) : null);
                return status === 'rejected';
            }) ||
            Object.values(profile.kyc_document_statuses || {}).includes('rejected');

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 shrink-0 shadow-sm sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-100">
                            C
                        </div>
                        <span className="text-sm font-semibold text-gray-800 capitalize tracking-wider">Cureza Seller Hub</span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-650 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all border border-gray-100 hover:border-red-100"
                    >
                        <LogOut size={13} />
                        Logout Partner
                    </button>
                </header>

                {/* Main Lock Screen Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center items-start">
                    <div className="max-w-5xl w-full bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-10 space-y-10 relative overflow-hidden my-4">
                        <div className={`absolute top-0 left-0 w-full h-2 ${isResubmit ? 'bg-gradient-to-r from-red-400 to-orange-500 animate-pulse' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}></div>
                        
                        {/* Title Bar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-8">
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${isResubmit ? 'bg-red-50 text-red-500 shadow-red-100 animate-bounce' : 'bg-amber-50 text-amber-600 shadow-amber-100 animate-pulse'}`}>
                                    <ShieldCheck size={28} strokeWidth={2} />
                                </div>
                                <div className="space-y-1">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-semibold capitalize tracking-wider shadow-sm ${isResubmit ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isResubmit ? 'bg-red-600' : 'bg-amber-600'} animate-ping`}></span>
                                        {isResubmit ? 'Action Required' : 'Verification Under Review'}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">
                                        {isResubmit ? 'Onboarding Block: Action Required' : 'Compliance Verification Process'}
                                    </h2>
                                    <p className="text-gray-650 font-medium text-xs leading-relaxed max-w-lg">
                                        {isResubmit 
                                            ? 'Some of your uploaded KYC documents or information did not meet verification criteria. Please review the highlighted document feedback below.'
                                            : 'Your documents and onboarding details have been submitted successfully. Our compliance team is currently verifying your profile details.'
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            {isResubmit && (
                                <button
                                    onClick={() => router.push('/seller/register')}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-semibold capitalize tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group shrink-0"
                                >
                                    Update KYC & Re-Upload
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {/* Left Side: Steps and Documents Grid (66%) */}
                            <div className="lg:col-span-2 space-y-8">
                                
                                {/* Steps Progress Indicator */}
                                <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-4">
                                    <h3 className="text-[10px] font-semibold text-gray-500 capitalize tracking-wider leading-none">Onboarding Milestones</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <StepItem label="Identity Setup" desc="Register & Credentials" status="complete" />
                                        <StepItem label="Partner Verify" desc="Email & Mobile OTP" status="complete" />
                                        <StepItem label="KYC Documents" desc={`${companyType} Files`} status={isResubmit ? 'attention' : 'review'} />
                                    </div>
                                </div>

                                {/* Dynamic KYC Documents Dossier */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-semibold text-gray-500 capitalize tracking-wider border-b border-gray-100 pb-2 leading-none flex items-center gap-2">
                                        <FileText size={12} className="text-emerald-500" />
                                        Compliance Verification Dossier
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeDocs.map((doc) => {
                                            const legacyId = getLegacyKey(doc.id);
                                            // PRIORITIZE SPECIFIC STATUS IN JSON ARRAY
                                            let docStatus = profile.kyc_document_statuses?.[doc.id];
                                            if (!docStatus && legacyId) {
                                                docStatus = profile.kyc_document_statuses?.[legacyId];
                                            }
                                            if (!docStatus) {
                                                if (doc.id === 'bank_proof') {
                                                    docStatus = profile.cheque_status;
                                                } else if (doc.id === 'gst_cert') {
                                                    docStatus = profile.gst_status;
                                                } else if (['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'].includes(doc.id)) {
                                                    docStatus = profile.pan_status;
                                                } else if (['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'].includes(doc.id)) {
                                                    docStatus = profile.aadhaar_status;
                                                } else if (['signatory_signature', 'director_signature', 'partner_signature'].includes(doc.id)) {
                                                    docStatus = profile.signature_status;
                                                } else {
                                                    docStatus = profile[`${doc.id}_status`];
                                                    if (!docStatus && legacyId) {
                                                        docStatus = profile[`${legacyId}_status`];
                                                    }
                                                }
                                            }
                                            if (!docStatus) {
                                                docStatus = 'pending';
                                            }

                                            // PRIORITIZE SPECIFIC REASON IN JSON ARRAY
                                            let docReason = profile.kyc_document_reasons?.[doc.id];
                                            if (!docReason && legacyId) {
                                                docReason = profile.kyc_document_reasons?.[legacyId];
                                            }
                                            if (!docReason) {
                                                if (doc.id === 'bank_proof') {
                                                    docReason = profile.kyc_document_reasons?.['cheque'];
                                                } else if (doc.id === 'gst_cert') {
                                                    docReason = profile.kyc_document_reasons?.['gst'];
                                                } else if (['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'].includes(doc.id)) {
                                                    docReason = profile.kyc_document_reasons?.['pan'];
                                                } else if (['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'].includes(doc.id)) {
                                                    docReason = profile.kyc_document_reasons?.['aadhaar'];
                                                } else if (['signatory_signature', 'director_signature', 'partner_signature'].includes(doc.id)) {
                                                    docReason = profile.kyc_document_reasons?.['signature'];
                                                }
                                            }
                                            if (!docReason) {
                                                docReason = '';
                                            }

                                            // File preview link resolution
                                            let filePath = profile.kyc_docs?.[doc.id] || '';
                                            if (!filePath && legacyId) {
                                                filePath = profile.kyc_docs?.[legacyId] || '';
                                            }
                                            if (doc.id === 'bank_proof' && !filePath) {
                                                filePath = profile.cheque_image_path || '';
                                            }
                                            if (doc.id === 'gst_cert' && !filePath) {
                                                filePath = profile.gst_image_path || '';
                                            }
                                            if (['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'].includes(doc.id) && !filePath) {
                                                filePath = profile.pan_image_path || '';
                                            }
                                            if (['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'].includes(doc.id) && !filePath) {
                                                filePath = profile.aadhaar_image_path || '';
                                            }
                                            if (['signatory_signature', 'director_signature', 'partner_signature'].includes(doc.id) && !filePath) {
                                                filePath = profile.signature_image_path || '';
                                            }

                                            let absolutePath = '';
                                            if (filePath) {
                                                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                                                if (filePath.startsWith('/storage/')) {
                                                    absolutePath = `${backendUrl}${filePath}`;
                                                } else if (filePath.startsWith('http')) {
                                                    absolutePath = filePath;
                                                } else {
                                                    absolutePath = `${backendUrl}/storage/${filePath}`;
                                                }
                                            }

                                            return (
                                                <div key={doc.id} className={`p-4 border rounded-2xl flex flex-col justify-between gap-3 bg-white shadow-sm transition-all ${
                                                    docStatus === 'rejected'
                                                        ? 'border-red-200 bg-red-50/5'
                                                        : docStatus === 'approved'
                                                            ? 'border-emerald-100 bg-emerald-50/5'
                                                            : 'border-gray-100'
                                                }`}>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate" title={doc.label}>{doc.label}</p>
                                                            <p className="text-[9px] text-gray-400 font-mono mt-0.5 uppercase tracking-tighter">ID: {doc.id}</p>
                                                        </div>
                                                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 ${
                                                            docStatus === 'approved'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : docStatus === 'rejected'
                                                                    ? 'bg-red-100 text-red-800 animate-pulse'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {docStatus === 'rejected' ? 'Needs Attention' : docStatus}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* File Attachment / Preview Indicator */}
                                                    {absolutePath ? (
                                                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <FileText size={12} className="text-gray-400 shrink-0" />
                                                                <span className="text-[9px] font-bold text-gray-600 truncate">
                                                                    {filePath.split('/').pop() || 'Uploaded Document'}
                                                                </span>
                                                            </div>
                                                            <a 
                                                                href={absolutePath}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 shrink-0 ml-2"
                                                            >
                                                                View File
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[9px] font-semibold text-gray-400 italic">
                                                            No file uploaded yet
                                                        </div>
                                                    )}
                                                    
                                                    {docStatus === 'rejected' && docReason && (
                                                        <div className="p-2.5 bg-red-100/50 border border-red-200 rounded-xl text-[9px] text-red-800 font-semibold leading-normal font-sans">
                                                            <span className="block text-[8px] uppercase tracking-wider text-red-500 mb-0.5 font-black">Verification Discrepancy:</span>
                                                            {docReason}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Status Box & Summary (33%) */}
                            <div className="space-y-6">
                                {/* Overall Feedback if any */}
                                {isResubmit && profile.rejection_reason && (
                                    <div className="bg-red-50 border border-red-200 rounded-3xl p-6 space-y-3 shadow-sm shadow-red-100 animate-in zoom-in duration-300">
                                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <AlertCircle size={12} />
                                            Admin Verification Report
                                        </h4>
                                        <p className="text-xs text-gray-900 font-semibold leading-relaxed">
                                            {profile.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                {/* Profile Summary */}
                                <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Registered Partner Dossier</h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-400 font-semibold">Entity Legal Title</span>
                                            <span className="text-gray-900 font-bold truncate max-w-[150px]">{user.name}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-400 font-semibold">Corporate Email</span>
                                            <span className="text-gray-900 font-bold truncate max-w-[150px]">{user.email}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-400 font-semibold">Constitution Type</span>
                                            <span className="text-gray-900 font-bold">{companyType}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-400 font-semibold">Audit Verdict</span>
                                            <span className={`${isResubmit ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'} font-bold px-2 py-0.5 rounded-md`}>
                                                {isResubmit ? 'Blocked' : 'Reviewing'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Standard Service notice */}
                                <div className="p-6 border border-gray-100 rounded-3xl space-y-2.5">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Verification SLA</h5>
                                    <p className="text-[10px] text-gray-500 leading-normal font-medium">
                                        Standard compliance vetting cycle is **24 - 48 hours**. Once successfully verified, your Hub dashboard will be unlocked and a confirmation email will be dispatched.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-50 flex-col md:flex-row seller-theme">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100 shrink-0"
                    >
                        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    <h2 className="font-bold text-gray-900 text-sm truncate max-w-[140px]">
                        {pathname.startsWith('/seller/dashboard/') && pathname !== '/seller/dashboard' && !SELLER_LINKS.some(l => l.href === pathname)
                            ? dynamicReportTabName
                            : (SELLER_LINKS.find(l => l.href === pathname)?.name || 'Dashboard')}
                    </h2>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <NotificationBell />
                    <div className="relative" ref={mobileProfileMenuRef}>
                        <button
                            onClick={() => setProfileMenuOpen(prev => !prev)}
                            className="flex items-center rounded-2xl bg-transparent p-1 outline-none focus:outline-none transition-all"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center text-gray-500 shadow-inner overflow-hidden shrink-0">
                                {brandLogoUrl ? (
                                    <img src={brandLogoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-gray-500" />
                                )}
                            </div>
                        </button>
                        {profileMenuOpen && (
                            <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-cureza-green border border-emerald-100 shrink-0 overflow-hidden">
                                            {brandLogoUrl ? (
                                                <img src={brandLogoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 text-xs">
                                    <Link
                                        href="/seller/dashboard/profile"
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        <span>Store Profile</span>
                                        <ArrowRight size={12} />
                                    </Link>
                                    <Link
                                        href="/seller/dashboard/settings"
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50"
                                    >
                                        <span>Account Settings</span>
                                        <ArrowRight size={12} />
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold text-red-600 hover:bg-red-50 text-left"
                                    >
                                        <span>Logout</span>
                                        <LogOut size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Sidebar Overlay for Mobile */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] transition-opacity"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-[#fbfefc] dark:bg-gray-900 border-r border-emerald-100/70 dark:border-gray-800
                fixed inset-y-0 left-0 z-[70] md:z-30 shrink-0
                transform md:transform-none transition-transform duration-200 ease-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                md:flex shadow-[12px_0_35px_rgba(15,76,58,0.06)] flex flex-col justify-between
            `}>
                <div className="px-3.5 py-3 border-b border-emerald-100/70 dark:border-gray-800 shrink-0">
                    <Link href="/" className="group block w-full">
                        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm px-3 py-2.5 group-hover:border-cureza-green/40 group-hover:shadow-md transition-all">
                            <div className="flex items-center justify-between gap-3">
                                <img src="/logo-black.svg" alt="Cureza Logo" className="h-7 w-auto max-w-[118px] object-contain dark:invert transition-transform group-hover:scale-[1.02]" />
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[7px] font-semibold capitalize tracking-wide text-cureza-green border border-emerald-100">
                                    Hub
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[8px] font-semibold capitalize tracking-wider text-gray-550">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Verified Seller Workspace
                            </div>
                        </div>
                    </Link>
                </div>

                <nav className="px-3 py-3 space-y-1 overflow-y-auto flex-1">
                    <div className="px-2.5 pb-1 text-[8px] font-semibold capitalize tracking-wider text-gray-500">
                        Navigation
                    </div>
                    {SELLER_LINKS.map((link) => {
                        const Icon = link.icon;
                        const isActive = link.href === '/seller/dashboard'
                            ? pathname === link.href
                            : pathname === link.href || pathname.startsWith(`${link.href}/`);
                        const linkName = link.href === '/seller/dashboard/divsoma' ? dynamicReportTabName : link.name;

                        return (
                            <Link
                                key={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                href={link.href}
                                className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 group border ${isActive
                                    ? 'bg-white text-cureza-green border-emerald-100 shadow-sm'
                                    : 'text-gray-550 border-transparent hover:bg-white hover:text-gray-900 hover:border-emerald-100/50 hover:shadow-sm dark:hover:bg-gray-800'
                                    }`}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cureza-green" />
                                )}
                                <span className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${isActive
                                    ? 'bg-emerald-50 text-cureza-green'
                                    : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-cureza-green'
                                    }`}>
                                    <Icon size={14} />
                                </span>
                                <span className="truncate">{linkName}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-emerald-100/70 dark:border-gray-800 shrink-0 bg-white/60">
                    {/* Dynamic verified brand banner */}
                    <Link href={`/seller/dashboard/${brandSlug}`} onClick={() => setMobileMenuOpen(false)}>
                        <div className="bg-[#0f4c3a] border border-emerald-700 rounded-xl p-3 relative overflow-hidden shadow-lg shadow-emerald-950/15 hover:-translate-y-0.5 hover:shadow-emerald-950/25 transition-all cursor-pointer group">
                            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-300/80 pointer-events-none" />

                            <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-emerald-200 group-hover:scale-105 transition-transform">
                                    <Sparkles size={14} />
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/10 text-emerald-100 border border-white/15 px-1.5 py-0.5 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                    <span className="text-[7px] font-semibold capitalize tracking-wide">Verified</span>
                                </div>
                            </div>

                            <div className="mt-3">
                                <span className="text-[7px] font-semibold text-emerald-200 capitalize tracking-wide block">Authorized Partner</span>
                                <h4 className="text-[10px] font-semibold text-white mt-1 leading-tight tracking-tight break-words" title={`${sellerBrandName} x Cureza`}>
                                    {sellerBrandName} <span className="text-emerald-300 font-normal">x</span> Cureza
                                </h4>
                                <p className="text-[8px] text-emerald-50/75 mt-1.5 font-medium leading-relaxed">
                                    View your verified brand node, billing status, and settlement profile.
                                </p>
                                <div className="mt-2 flex items-center gap-1 text-[8px] font-semibold capitalize tracking-wide text-emerald-100">
                                    Open Brand Desk <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="w-full min-w-0 flex-1 md:ml-64">
                <header className="hidden md:flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 h-16 md:sticky md:top-0 z-50">
                    <div className="w-full h-full flex items-center justify-between px-4 md:px-8">
                        <div className="flex items-center gap-4 min-w-0">
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm sm:text-lg truncate max-w-[150px] sm:max-w-none">
                                    {pathname.startsWith('/seller/dashboard/') && pathname !== '/seller/dashboard' && !SELLER_LINKS.some(l => l.href === pathname)
                                        ? dynamicReportTabName
                                        : (SELLER_LINKS.find(l => l.href === pathname)?.name || 'Dashboard')}
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            {/* Status Banner for Pending Sellers */}
                            {(user as any).seller_profile?.status === 'pending' && (
                                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-yellow-55 border border-yellow-200 rounded-full animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-[11px] font-semibold text-yellow-750 capitalize tracking-wide">Application Under Review</span>
                                </div>
                            )}

                            <NotificationBell />

                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setProfileMenuOpen(prev => !prev)}
                                    className="flex items-center gap-2 sm:gap-3 rounded-2xl bg-transparent p-1 sm:p-1.5 outline-none focus:outline-none transition-all"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-semibold capitalize tracking-wider text-gray-500">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                                        <p className="text-[10px] font-semibold capitalize text-emerald-700 mt-1">Verified Seller</p>
                                    </div>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center text-gray-500 shadow-inner shrink-0 overflow-hidden">
                                        {brandLogoUrl ? (
                                            <img src={brandLogoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                        )}
                                    </div>
                                </button>

                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50">
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-cureza-green border border-emerald-100">
                                                    <User size={22} />
                                                </div>
                                                <div className="min-w-0">
                                                     <p className="text-sm font-semibold text-gray-950 truncate">{user.name}</p>
                                                     <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                     <p className="mt-1 text-[10px] font-semibold capitalize tracking-wide text-emerald-700">Seller Dashboard Access</p>
                                                 </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                href="/seller/dashboard/profile"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <span>Store Profile</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                            <Link
                                                href="/seller/dashboard/settings"
                                                onClick={() => setProfileMenuOpen(false)}
                                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <span>Account Settings</span>
                                                <ArrowRight size={14} />
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                <span>Logout</span>
                                                <LogOut size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

function StepItem({ label, desc, status }: { label: string; desc: string; status: 'complete' | 'review' | 'attention' }) {
    return (
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            status === 'complete' 
                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                : status === 'attention' 
                ? 'bg-red-50/50 border-red-100 text-red-800' 
                : 'bg-amber-50/50 border-amber-100 text-amber-800'
        }`}>
            <span className="text-[10px] font-semibold capitalize tracking-wide">{label}</span>
            <span className="text-[9px] text-gray-600 font-semibold mt-1">{desc}</span>
        </div>
    );
}
