'use client';

import {
    ArrowLeft, CheckCircle, XCircle, FileText, Globe, MapPin, Mail, Phone,
    Download, Building, CreditCard, Eye, AlertTriangle, Clock, Edit3,
    Trash2, ArrowRight, ShieldCheck, ExternalLink, Calendar, ChevronRight,
    Upload, Building2, BadgePercent, UserCheck, BookOpen, FileSpreadsheet,
    User2, FileCheck2, TrendingUp, AlertCircle, Sparkles, Check
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

export default function AdminSellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [seller, setSeller] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const router = useRouter();

    const [rejectionModal, setRejectionModal] = useState<{ show: boolean, requestId: string | null, section: string }>({ show: false, requestId: null, section: '' });
    const [rejectionReason, setRejectionReason] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);

    const fetchSeller = async () => {
        try {
            const response = await api.get(`/admin/sellers/${id}`);
            setSeller(response.data);
            setEditForm({
                name: response.data.name,
                email: response.data.email,
                phone: response.data.phone || '',
                profile: { ...response.data.profile }
            });
        } catch (error) {
            console.error('Failed to fetch seller details', error);
            showToast('Failed to load seller details', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSeller();
    }, [id]);

    const handleSaveEdits = async () => {
        try {
            await api.put(`/admin/sellers/${id}`, editForm);
            showToast('Seller details updated successfully', 'success');
            setIsEditing(false);
            fetchSeller();
        } catch (error) {
            showToast('Failed to update details', 'error');
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            await api.post(`/admin/seller-requests/${requestId}/approve`);
            showToast('Request approved and changes applied', 'success');
            fetchSeller();
        } catch (error) {
            showToast('Approval failed', 'error');
        }
    };

    const handleRejectRequest = async () => {
        if (!rejectionReason) return showToast('Reason is required', 'error');
        try {
            await api.post(`/admin/seller-requests/${rejectionModal.requestId}/reject`, {
                rejection_reason: rejectionReason
            });
            showToast('Request rejected', 'success');
            setRejectionModal({ show: false, requestId: null, section: '' });
            setRejectionReason('');
            fetchSeller();
        } catch (error) {
            showToast('Rejection failed', 'error');
        }
    };

    const handleApproveSeller = async () => {
        try {
            await api.post(`/admin/sellers/${id}/approve`);
            showToast('Seller account approved', 'success');
            fetchSeller();
        } catch (error) {
            showToast('Action failed', 'error');
        }
    };

    const handleRejectSeller = async () => {
        if (!confirm('Reject this seller account completely?')) return;
        try {
            await api.post(`/admin/sellers/${id}/reject`);
            showToast('Seller account rejected', 'success');
            fetchSeller();
        } catch (error) {
            showToast('Action failed', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Seller Dossier...</p>
                </div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="p-16 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <AlertCircle size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Seller Not Found</h3>
                <p className="text-xs text-gray-500">The seller profile you are trying to access does not exist or has been removed.</p>
                <Link href="/superadmin/dashboard/users/sellers" className="inline-flex h-10 items-center justify-center px-6 bg-gray-900 text-white text-xs font-bold uppercase rounded-xl hover:bg-gray-800 transition-all">
                    Go Back to Listings
                </Link>
            </div>
        );
    }

    const profile = isEditing ? editForm.profile : (seller.profile || {});
    const brand = seller.brand || {};
    const companyType = profile.company_type || 'Sole Proprietorship';

    // Grouping all document types by logic based on Company Type selection
    const getCategorizedDocs = () => {
        const categories: Record<string, { title: string; docs: { id: string; label: string; placeholder?: string; hasNumber?: boolean; required?: boolean }[] }> = {
            constitution: {
                title: "Constitution & Legal Registration Documents",
                docs: []
            },
            identity: {
                title: "Authorized Signatories & Directors Identification",
                docs: []
            },
            taxBank: {
                title: "Tax, Finance & Settlement Credentials",
                docs: [
                    { id: 'bank_proof', label: 'Bank Account Proof (Cheque / Statement)', required: true },
                    { id: 'gst_cert', label: 'GST Certificate (GSTIN Proof)', hasNumber: true, placeholder: 'Enter GSTIN' },
                    { id: 'udyam', label: 'Udyam Registration Certificate', hasNumber: true, placeholder: 'Enter Udyam Number' },
                    { id: 'startup_india', label: 'Startup India Recognition', hasNumber: true, placeholder: 'Enter Startup ID' },
                    { id: 'address_proof', label: 'Registered Address Proof' },
                ]
            },
            licenses: {
                title: "Regulatory Compliance & Trade Licenses",
                docs: []
            }
        };

        // 1. Add Dynamic Selected Licenses
        const selectedLicenses = profile.selected_licenses || [];
        selectedLicenses.forEach((lic: string) => {
            if (lic !== 'Upload Later') {
                const licId = `license_${lic.toLowerCase().replace(/ /g, '_').replace(/\//g, '')}`;
                categories.licenses.docs.push({
                    id: licId,
                    label: `${lic} License`,
                    required: true,
                    hasNumber: true,
                    placeholder: `Enter ${lic} Number`
                });
            }
        });

        // 2. Add Specific Constitution and Identification Documents based on Company Type
        if (companyType === 'Sole Proprietorship') {
            categories.constitution.docs.push(
                { id: 'proprietor_pan', label: 'Proprietor Personal PAN', required: true, hasNumber: true, placeholder: 'Enter PAN' },
                { id: 'proprietor_aadhaar', label: 'Proprietor Aadhaar Card', required: true, hasNumber: true, placeholder: 'Enter Aadhaar' }
            );
        } else if (companyType === 'Partnership Firm') {
            categories.constitution.docs.push(
                { id: 'partnership_deed', label: 'Partnership Deed Document', required: true },
                { id: 'firm_pan', label: 'Firm Dedicated PAN Card', required: true, hasNumber: true, placeholder: 'Firm PAN' }
            );
            categories.identity.docs.push(
                { id: 'auth_letter', label: 'Partner Authorization Letter', required: true },
                { id: 'signatory_pan', label: 'Authorized Signatory PAN Card', required: true, hasNumber: true },
                { id: 'signatory_aadhaar', label: 'Authorized Signatory Aadhaar Card', required: true, hasNumber: true },
                { id: 'signatory_photo', label: 'Signatory Photo Portrait', required: true },
                { id: 'signatory_signature', label: 'Signatory Signature Specimen', required: true }
            );
        } else if (companyType === 'Private Limited Company') {
            categories.constitution.docs.push(
                { id: 'coi', label: 'Certificate of Incorporation (COI)', required: true },
                { id: 'moa', label: 'MOA (Memorandum of Association)', required: true },
                { id: 'aoa', label: 'AOA (Articles of Association)', required: true },
                { id: 'company_pan', label: 'Company Corporate PAN Card', required: true, hasNumber: true }
            );
            categories.identity.docs.push(
                { id: 'director_pan', label: 'Managing Director PAN Card', required: true, hasNumber: true },
                { id: 'director_aadhaar', label: 'Managing Director Aadhaar Card', required: true, hasNumber: true },
                { id: 'director_photo', label: 'Director Photograph Portrait', required: true },
                { id: 'director_signature', label: 'Director Signature Specimen', required: true }
            );
        } else if (companyType === 'LLP') {
            categories.constitution.docs.push(
                { id: 'llp_coi', label: 'LLP Certificate of Incorporation', required: true },
                { id: 'llp_agreement', label: 'LLP Partnership Agreement', required: true },
                { id: 'llp_pan', label: 'LLP Dedicated PAN Card', required: true, hasNumber: true }
            );
            categories.identity.docs.push(
                { id: 'auth_letter_llp', label: 'LLP Partner Authorization Letter', required: true },
                { id: 'partner_pan_upload', label: 'Designated Partner PAN Card', required: true },
                { id: 'partner_aadhaar_upload', label: 'Designated Partner Aadhaar Card', required: true },
                { id: 'partner_signature', label: 'Designated Partner Signature Specimen', required: true }
            );
        }

        // 3. Fallback: Scan profile.kyc_docs and profile.kyc_numbers for any uploaded files or entered numbers not listed yet!
        const listedIds = new Set<string>();
        Object.values(categories).forEach(cat => {
            cat.docs.forEach(doc => listedIds.add(doc.id));
        });

        const allUploadedDocIds = new Set<string>([
            ...Object.keys(profile.kyc_docs || {}),
            ...Object.keys(profile.kyc_numbers || {})
        ]);

        allUploadedDocIds.forEach(id => {
            if (!listedIds.has(id)) {
                // Determine dynamic label prettily
                let label = id
                    .replace(/_/g, ' ')
                    .replace('license ', '')
                    .toUpperCase();
                
                // Map known names to look extra premium
                if (label === 'COA  LAB REPORTS') {
                    label = 'COA / Lab Reports';
                } else if (label === 'FSSAI LICENSE') {
                    label = 'FSSAI License';
                } else if (label === 'DRUG LICENSE') {
                    label = 'Drug License';
                } else if (label === 'AYUSH LICENSE') {
                    label = 'Ayush License';
                }

                if (id.startsWith('license_')) {
                    categories.licenses.docs.push({
                        id,
                        label: label.endsWith(' License') || label.endsWith(' LICENSE') ? label : `${label} License`,
                        required: false,
                        hasNumber: true,
                        placeholder: 'Enter License Number'
                    });
                } else {
                    categories.taxBank.docs.push({
                        id,
                        label,
                        required: false,
                        hasNumber: true,
                        placeholder: 'Enter Number'
                    });
                }
            }
        });

        return categories;
    };

    const categorizedDocs = getCategorizedDocs();

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 font-sans selection:bg-emerald-500 selection:text-white">
            {/* Header / Command Center */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 -mx-8 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        href="/superadmin/dashboard/users/sellers"
                        className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-inner border border-gray-100 dark:border-gray-700"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="text-2xl font-black bg-transparent border-b-2 border-emerald-500 focus:outline-none text-gray-900 dark:text-white pb-1 font-sans"
                                />
                            ) : (
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{seller.name}</h1>
                            )}
                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm ${
                                profile.status === 'approved' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : profile.status === 'rejected' 
                                        ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' 
                                        : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            }`}>
                                {profile.status || 'Pending Review'}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-2">
                            <Sparkles size={12} className="text-emerald-500" />
                            Dossier ID: SEL-{seller.id} • Registered Business Partner
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-250 text-gray-600 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdits}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-100"
                            >
                                <Check size={14} strokeWidth={3} />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-xs uppercase tracking-wider shadow-sm"
                            >
                                <Edit3 size={14} />
                                Edit Account info
                            </button>

                            {profile.status !== 'approved' && (
                                <button
                                    onClick={handleApproveSeller}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 hover:shadow-lg transition-all font-bold text-xs uppercase tracking-wider shadow-md hover:-translate-y-0.5"
                                >
                                    <CheckCircle size={14} />
                                    Approve Vendor
                                </button>
                            )}

                            {profile.status !== 'rejected' && (
                                <button
                                    onClick={handleRejectSeller}
                                    className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-bold text-xs uppercase tracking-wider"
                                >
                                    <XCircle size={14} />
                                    Reject Vendor
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatusCard
                    label="Compliance Status"
                    value={profile.status || 'Under Review'}
                    status={profile.status === 'approved' ? 'success' : profile.status === 'rejected' ? 'danger' : 'warning'}
                    icon={ShieldCheck}
                />
                <StatusCard
                    label="KYC Completion"
                    value={calculateKYCProgress(profile)}
                    status="info"
                    icon={FileText}
                />
                <StatusCard
                    label="Company Constitution"
                    value={companyType}
                    status="default"
                    icon={Building2}
                />
                <StatusCard
                    label="Onboarding Age"
                    value={`Joined ${new Date(seller.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    status="default"
                    icon={Calendar}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Dossier Cards */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Legal Company Profiles details */}
                    <DetailSection
                        title="Corporate & Legal Business Profiling"
                        icon={Building}
                        pending={seller.pending_requests?.profile?.[0]}
                        onApprove={handleApproveRequest}
                        onReject={(requestId: string) => setRejectionModal({ show: true, requestId, section: 'Profile' })}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                            <InfoField
                                label="Registering Business As"
                                value={profile.registering_as || 'Vendor / Brand'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, registering_as: val } })}
                            />
                            <InfoField
                                label="Selected Constitution Type"
                                value={companyType}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, company_type: val } })}
                            />
                            <InfoField
                                label="Primary Contact Person"
                                value={profile.contact_person || 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, contact_person: val } })}
                            />
                            <InfoField
                                label="Corporate Partner Email"
                                value={isEditing ? editForm.email : seller.email}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, email: val })}
                            />
                            <InfoField
                                label="Corporate Partner Phone"
                                value={isEditing ? editForm.phone : seller.phone || 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, phone: val })}
                            />
                            <InfoField
                                label="Product Sourcing Protocol"
                                value={profile.sourcing_method || 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, sourcing_method: val } })}
                            />
                            <InfoField
                                label="Self-Reported Annual Turnover"
                                value={profile.annual_turnover || 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, annual_turnover: val } })}
                            />
                            <InfoField
                                label="Vintage / Year Started"
                                value={profile.brand_started_on ? new Date(profile.brand_started_on).getFullYear().toString() : 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, brand_started_on: val } })}
                            />
                            <InfoField
                                label="Official Website Link"
                                value={profile.website_url || profile.website || 'N/A'}
                                isLink={!!(profile.website_url || profile.website)}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, website_url: val } })}
                            />
                            <InfoField
                                label="Acquisition Source Channel"
                                value={profile.found_us_via || 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, found_us_via: val } })}
                            />

                            <div className="md:col-span-2 space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin size={10} className="text-emerald-600" />
                                    Registered Corporate Office Address
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoField
                                        label="Address Line 1"
                                        value={profile.address_line_1}
                                        isEditing={isEditing}
                                        onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, address_line_1: val } })}
                                    />
                                    <InfoField
                                        label="Address Line 2"
                                        value={profile.address_line_2 || 'N/A'}
                                        isEditing={isEditing}
                                        onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, address_line_2: val } })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <InfoField
                                        label="City"
                                        value={profile.city}
                                        isEditing={isEditing}
                                        onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, city: val } })}
                                    />
                                    <InfoField
                                        label="State"
                                        value={profile.state || 'N/A'}
                                        isEditing={isEditing}
                                        onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, state: val } })}
                                    />
                                    <InfoField
                                        label="Country"
                                        value={profile.country || 'India'}
                                        isEditing={isEditing}
                                        onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, country: val } })}
                                    />
                                    <InfoField
                                        label="Postal Code (PIN)"
                                        value={profile.pin_code}
                                        isEditing={isEditing}
                                        onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, pin_code: val } })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visual Category & Concern Badging */}
                        <div className="p-8 bg-gray-50/40 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 space-y-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <BookOpen size={10} className="text-emerald-600" />
                                Onboarding Target Segments
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Primary Product Categories</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.product_categories && profile.product_categories.length > 0 ? (
                                            profile.product_categories.map((cat: string) => (
                                                <span key={cat} className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-100">
                                                    {cat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic font-medium">No Categories Configured</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Therapeutic Concerns Catered To</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.concerns_catered && profile.concerns_catered.length > 0 ? (
                                            profile.concerns_catered.map((con: string) => (
                                                <span key={con} className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wide border border-blue-100">
                                                    {con}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic font-medium">No Concerns Configured</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DetailSection>

                    {/* Bank & Tax Details Section */}
                    <DetailSection
                        title="Financial Settlements & Tax Credentials"
                        icon={CreditCard}
                        pending={seller.pending_requests?.bank?.[0]}
                        onApprove={handleApproveRequest}
                        onReject={(requestId: string) => setRejectionModal({ show: true, requestId, section: 'Bank' })}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                            <InfoField
                                label="Official Clearing Bank"
                                value={profile.bank_name}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, bank_name: val } })}
                            />
                            <InfoField
                                label="Branch Location"
                                value={profile.branch_name}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, branch_name: val } })}
                            />
                            <InfoField
                                label="Account Holder Title"
                                value={profile.account_holder_name || 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, account_holder_name: val } })}
                            />
                            <InfoField
                                label="Settlement Account Number"
                                value={profile.bank_account_number}
                                isSecure
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, bank_account_number: val } })}
                            />
                            <InfoField
                                label="Clearing Code (IFSC)"
                                value={profile.ifsc_code}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, ifsc_code: val } })}
                            />
                            <InfoField
                                label="Taxpayer PAN ID"
                                value={profile.pan_number}
                                isSecure
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, pan_number: val } })}
                            />
                            <InfoField
                                label="GSTIN Clearance ID"
                                value={profile.gst_number || 'N/A'}
                                isEditing={isEditing}
                                onChange={(val: string) => setEditForm({ ...editForm, profile: { ...editForm.profile, gst_number: val } })}
                            />
                        </div>
                    </DetailSection>
                </div>

                {/* Right Dossier Cards: Review Panel */}
                <div className="space-y-8">
                    {/* Compliance resubmission manager card */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
                        <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 pb-3 text-sm">
                            <ShieldCheck size={18} className="text-emerald-600" />
                            Compliance Review Panel
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
                                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-[11px] font-semibold text-amber-800 leading-normal">
                                    Enabling resubmission allows the seller to modify their onboarding details and re-upload invalid files on their registration flow step 3.
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-b border-gray-50 py-3">
                                <span className="text-[10px] font-black uppercase text-gray-400">Resubmit Access Permission</span>
                                <button
                                    onClick={async () => {
                                        try {
                                            const updatedResubmit = !profile.resubmit_allowed;
                                            await api.put(`/admin/sellers/${id}`, {
                                                name: seller.name,
                                                email: seller.email,
                                                phone: seller.phone,
                                                profile: {
                                                    ...profile,
                                                    resubmit_allowed: updatedResubmit
                                                }
                                            });
                                            showToast(updatedResubmit ? 'Resubmission Access Granted' : 'Resubmission Access Revoked', 'success');
                                            fetchSeller();
                                        } catch (e) {
                                            showToast('Failed to update control', 'error');
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all border ${
                                        profile.resubmit_allowed
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                >
                                    {profile.resubmit_allowed ? '✓ Resubmission Granted' : 'Grant Resubmit'}
                                </button>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-gray-400">General Audit & Rejection Feedback</span>
                                <textarea
                                    value={isEditing ? editForm.profile.rejection_reason : (profile.rejection_reason || '')}
                                    disabled={!isEditing}
                                    onChange={(e) => setEditForm({
                                        ...editForm,
                                        profile: {
                                            ...editForm.profile,
                                            rejection_reason: e.target.value
                                        }
                                    })}
                                    placeholder="Click Full Edit above to write feedback on the overall application discrepancy (e.g. GST matches company type, bank statement needs signature)..."
                                    className="w-full h-28 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all disabled:bg-gray-50/50 leading-relaxed font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="bg-gray-50/50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-xs">
                                <Clock size={16} className="text-emerald-600" />
                                Partner Account Activity
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <ActivityItem label="Last Session Log" value={seller.last_login_at ? new Date(seller.last_login_at).toLocaleString('en-IN') : 'No Active Session'} />
                            <ActivityItem label="Profile Modified" value={new Date(profile.updated_at).toLocaleDateString('en-IN')} />
                            <ActivityItem label="Email Account Verified" value={seller.email_verified_at ? 'Yes' : 'No'} isBadge />
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/30">
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2 text-xs">
                            <ShieldCheck size={16} />
                            Platform Service SLA
                        </h3>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/85 leading-relaxed font-semibold">
                            All seller profiles are protected under dynamic service agreement SLA metrics. Do not share raw KYC files outside the secure superadmin portal.
                        </p>
                    </div>
                </div>
            </div>

            {/* Document Categorization Sections */}
            <div className="space-y-12 pt-12 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="text-emerald-600" size={24} />
                        Regulatory & Identification Dossier
                    </h2>
                    <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">
                        Dynamic lists loaded based on constitution: <span className="text-emerald-600 font-extrabold">{companyType}</span>
                    </p>
                </div>

                {/* Iterate over all categories */}
                {Object.entries(categorizedDocs).map(([catKey, cat]) => {
                    if (cat.docs.length === 0) return null;
                    
                    // Filter if documents exist in profile kyc_docs or standard image paths
                    const docList = cat.docs.filter(doc => {
                        let filePath = profile.kyc_docs?.[doc.id] || '';
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
                        const hasVal = !!profile[`${doc.id}_number`] || !!profile.kyc_numbers?.[doc.id];
                        return hasFile || hasVal || doc.required;
                    });

                    if (docList.length === 0) return null;

                    return (
                        <div key={catKey} className="space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                                <FileCheck2 size={14} className="text-emerald-600 animate-pulse" />
                                {cat.title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {docList.map((doc) => (
                                    <KYCCard
                                        key={doc.id}
                                        sellerId={id}
                                        profile={profile}
                                        onUpdate={fetchSeller}
                                        showToast={showToast}
                                        docType={doc.id}
                                        labelOverride={doc.label}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rejection Modal */}
            {rejectionModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 text-red-600">
                                <div className="p-3 bg-red-100 rounded-2xl">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-xl font-black">Reject {rejectionModal.section} Update</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Rejection Reason</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this request is being rejected..."
                                    className="w-full h-32 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-4 focus:ring-red-100 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setRejectionModal({ show: false, requestId: null, section: '' })}
                                    className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectRequest}
                                    className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- UI COMPONENTS ---

function DetailSection({ title, icon: Icon, children, pending, onApprove, onReject }: any) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-gray-200/60 dark:hover:border-gray-700 transition-all">
            <div className="bg-gray-50/50 dark:bg-gray-800/50 px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:scale-110 transition-transform">
                        <Icon size={18} className="text-emerald-600" />
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white tracking-tight">{title}</h3>
                </div>
            </div>

            {children}

            {/* Integrated Pending Approval Hub */}
            {pending && (
                <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-900/30 p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-400 text-white rounded-xl animate-bounce">
                                <Clock size={18} />
                            </div>
                            <div>
                                <h4 className="font-black text-yellow-800 dark:text-yellow-400 uppercase text-xs tracking-widest">Pending Verification Hub</h4>
                                <p className="text-xs text-yellow-700 dark:text-yellow-500/80">Received on {new Date(pending.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onReject(pending.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-md shadow-red-200"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onApprove(pending.id)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-250 flex items-center gap-2"
                            >
                                <CheckCircle size={14} />
                                Approve Changes
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(pending.new_data).map(([key, val]: any) => {
                            if (pending.old_data?.[key] === val) return null;
                            return (
                                <div key={key} className="bg-white/80 dark:bg-gray-900/50 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-900/30">
                                    <p className="text-[10px] font-black text-yellow-600 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 line-through truncate max-w-[100px]">{pending.old_data?.[key] || '(empty)'}</span>
                                        <ArrowRight size={12} className="text-yellow-400 shrink-0" />
                                        <span className="text-sm font-bold text-yellow-900 dark:text-yellow-200 truncate">{val}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- UI COMPONENTS ---

function KYCCard({ docType, sellerId, profile, onUpdate, showToast, labelOverride }: any) {
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectReasonText, setRejectReasonText] = useState('');

    let status = profile.kyc_document_statuses?.[docType];
    if (!status) {
        if (docType === 'bank_proof') {
            status = profile.cheque_status;
        } else if (docType === 'gst_cert') {
            status = profile.gst_status;
        } else if (['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'].includes(docType)) {
            status = profile.pan_status;
        } else if (['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'].includes(docType)) {
            status = profile.aadhaar_status;
        } else if (['signatory_signature', 'director_signature', 'partner_signature'].includes(docType)) {
            status = profile.signature_status;
        } else {
            status = profile[`${docType}_status`];
        }
    }
    if (!status) {
        status = 'pending';
    }

    let filePath = profile.kyc_docs?.[docType] || '';
    if (docType === 'bank_proof' && !filePath) {
        filePath = profile.cheque_image_path || '';
    }
    if (docType === 'gst_cert' && !filePath) {
        filePath = profile.gst_image_path || '';
    }
    if (['proprietor_pan', 'firm_pan', 'company_pan', 'llp_pan'].includes(docType) && !filePath) {
        filePath = profile.pan_image_path || '';
    }
    if (['proprietor_aadhaar', 'signatory_aadhaar', 'director_aadhaar', 'partner_aadhaar_upload'].includes(docType) && !filePath) {
        filePath = profile.aadhaar_image_path || '';
    }
    if (['signatory_signature', 'director_signature', 'partner_signature'].includes(docType) && !filePath) {
        filePath = profile.signature_image_path || '';
    }

    let imagePath = filePath;

    // Ensure absolute URL for backend storage
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    if (imagePath && imagePath.startsWith('/storage/')) {
        imagePath = `${backendUrl}${imagePath}`;
    } else if (imagePath && !imagePath.startsWith('http')) {
        // Fallback for relative database paths missing storage/ prefix
        imagePath = `${backendUrl}/storage/${imagePath}`;
    }

    const number = profile[`${docType}_number`] || profile.kyc_numbers?.[docType] || null;
    const updatedAt = profile[`${docType}_updated_at`];
    
    // Label prettifier
    const label = labelOverride || docType
        .replace(/_/g, ' ')
        .replace('license ', '')
        .toUpperCase();

    const updateStatus = async (newStatus: string, reason?: string) => {
        try {
            await api.post(`/admin/sellers/${sellerId}/documents/${docType}`, { 
                status: newStatus,
                reason: reason || ''
            });
            showToast(`${label} ${newStatus}`, 'success');
            setShowRejectInput(false);
            setRejectReasonText('');
            onUpdate();
        } catch (error) {
            showToast('Action failed', 'error');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/admin/sellers/${sellerId}/documents/${docType}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast(`${label} uploaded successfully`, 'success');
            onUpdate();
        } catch (error) {
            showToast('Upload failed', 'error');
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete the ${label} document?`)) return;
        try {
            await api.delete(`/admin/sellers/${sellerId}/documents/${docType}`);
            showToast(`${label} deleted successfully`, 'success');
            onUpdate();
        } catch (error) {
            showToast('Delete failed', 'error');
        }
    };

    const documentReason = profile.kyc_document_reasons?.[docType] || '';

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col group relative hover:border-gray-200/60 transition-all">
            <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/20">
                <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-gray-900 dark:text-white uppercase text-[9px] tracking-widest truncate" title={label}>{label}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            status === 'approved' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : status === 'rejected' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {status}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                    {imagePath && (
                        <button
                            onClick={handleDelete}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Document"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                    {status !== 'approved' && (
                        <button onClick={() => updateStatus('approved')} className="p-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Approve">
                            <CheckCircle size={12} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 relative group/view shrink-0">
                    {imagePath ? (
                        <>
                            {imagePath.toLowerCase().endsWith('.pdf') ? (
                                <div className="flex flex-col items-center text-red-500">
                                    <FileText size={42} />
                                    <span className="text-[9px] font-black mt-2 text-gray-400 uppercase tracking-widest">PDF Document</span>
                                </div>
                            ) : (
                                <img src={imagePath} alt={label} className="w-full h-full object-cover group-hover/view:scale-110 transition-transform duration-500" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/view:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                                <a href={imagePath} target="_blank" className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg flex items-center justify-center">
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </>
                    ) : number ? (
                        <div className="text-center p-4">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Number</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight uppercase leading-snug">{number}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 opacity-35 text-gray-500">
                            <FileText size={28} strokeWidth={1.5} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">MISSING DOCUMENT</span>
                        </div>
                    )}

                    {/* Quick Upload Overlay */}
                    <label className="absolute inset-0 bg-emerald-600/90 opacity-0 group-hover/view:opacity-100 cursor-pointer flex flex-col items-center justify-center text-white transition-opacity duration-300">
                        <input type="file" className="hidden" onChange={handleUpload} accept="image/*,application/pdf" />
                        <Upload size={20} className="mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{imagePath ? 'Replace' : 'Upload'}</span>
                    </label>
                </div>

                {status === 'rejected' && documentReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-800 font-bold leading-normal font-sans">
                        <p className="uppercase text-[8px] text-amber-500 mb-0.5 font-extrabold tracking-wider">Rejection Reason:</p>
                        {documentReason}
                    </div>
                )}

                {showRejectInput ? (
                    <div className="space-y-2 pt-2 border-t border-gray-150 animate-in slide-in-from-bottom-2 duration-300">
                        <textarea
                            value={rejectReasonText}
                            onChange={(e) => setRejectReasonText(e.target.value)}
                            placeholder="State reason for rejection..."
                            className="w-full p-2 h-14 rounded-xl border border-gray-200 bg-white text-[10px] font-bold focus:ring-2 focus:ring-red-150 focus:border-red-500 outline-none transition-all placeholder:text-gray-400 leading-normal"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowRejectInput(false)}
                                className="flex-1 py-1 text-[9px] font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateStatus('rejected', rejectReasonText)}
                                className="flex-1 py-1 text-[9px] font-black text-white bg-red-650 hover:bg-red-700 rounded-lg transition-all shadow-sm"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ) : (
                    status !== 'rejected' && (
                        <button
                            onClick={() => setShowRejectInput(true)}
                            className="mt-2 w-full py-1.5 text-[8px] font-black uppercase tracking-widest text-red-600 border border-red-50 rounded-xl hover:bg-red-50 transition-all shrink-0"
                        >
                            Mark as Invalid
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

// --- ATOMS ---

function StatusCard({ label, value, status, icon: Icon }: any) {
    const colors = {
        success: 'text-emerald-600 bg-emerald-50/50 border-emerald-100',
        warning: 'text-yellow-600 bg-yellow-50/50 border-yellow-100',
        danger: 'text-red-600 bg-red-50/50 border-red-100',
        info: 'text-blue-600 bg-blue-50/50 border-blue-100',
        default: 'text-gray-600 bg-gray-50/50 border-gray-100'
    };

    return (
        <div className={`p-5 rounded-3xl border ${colors[status as keyof typeof colors]} flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 bg-white`}>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-inner border border-gray-100/50 dark:border-gray-800 shrink-0">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">{label}</p>
                <p className="text-[13px] font-extrabold capitalize mt-1.5 tracking-tight leading-none text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function InfoField({ label, value, isSecure, isLink, isEditing, onChange, type = "text" }: any) {
    return (
        <div className="space-y-2 flex flex-col min-w-0">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">{label}</span>
            {isEditing ? (
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full text-xs font-bold bg-white dark:bg-gray-800 border-b-2 border-gray-100 dark:border-gray-700 focus:border-emerald-500 focus:outline-none text-gray-900 dark:text-white pb-1 transition-colors font-sans"
                />
            ) : isLink && value ? (
                <a
                    href={value.startsWith('http') ? value : `https://${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-1 truncate"
                >
                    {value}
                    <ExternalLink size={10} className="shrink-0" />
                </a>
            ) : (
                <div className={`text-xs font-bold truncate ${isSecure ? 'font-mono text-gray-750' : 'text-gray-900 dark:text-gray-100'}`}>
                    {value || 'Not Provided'}
                </div>
            )}
        </div>
    );
}

function ActivityItem({ label, value, isBadge }: any) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className={`font-bold ${isBadge ? 'bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-emerald-100' : 'text-xs text-gray-900 dark:text-gray-100'}`}>
                {value}
            </span>
        </div>
    );
}

function calculateKYCProgress(profile: any) {
    const companyType = profile.company_type || 'Sole Proprietorship';
    const docs = ['bank_proof'];
    
    if (companyType === 'Sole Proprietorship') {
        docs.push('proprietor_pan', 'proprietor_aadhaar');
    } else if (companyType === 'Partnership Firm') {
        docs.push('partnership_deed', 'firm_pan', 'auth_letter', 'signatory_pan', 'signatory_aadhaar', 'signatory_photo', 'signatory_signature');
    } else if (companyType === 'Private Limited Company') {
        docs.push('coi', 'moa', 'aoa', 'company_pan', 'director_pan', 'director_aadhaar', 'director_photo', 'director_signature');
    } else if (companyType === 'LLP') {
        docs.push('llp_coi', 'llp_agreement', 'llp_pan', 'partner_pan_upload', 'partner_aadhaar_upload', 'partner_signature', 'auth_letter_llp');
    }

    const approved = docs.filter(doc => (profile[`${doc}_status`] || profile.kyc_document_statuses?.[doc]) === 'approved').length;
    return `${approved}/${docs.length} Approved`;
}
