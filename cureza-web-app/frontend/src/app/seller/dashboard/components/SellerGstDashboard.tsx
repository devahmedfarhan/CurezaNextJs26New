'use client';

import { useState, useEffect } from 'react';
import { 
    ShieldCheck, AlertCircle, FileText, Upload, Download, CheckCircle2, 
    RefreshCw, Sparkles, Building, Landmark, MapPin, Calculator, HelpCircle 
} from 'lucide-react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function SellerGstDashboard() {
    const { showToast } = useToast();
    const [gstin, setGstin] = useState('');
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verifiedData, setVerifiedData] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    
    // GSTR Report states
    const [range, setRange] = useState('30_days');
    const [gstrReport, setGstrReport] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(false);

    // KYC File Upload states
    const [companyType, setCompanyType] = useState('Proprietorship');
    const [panFile, setPanFile] = useState<File | null>(null);
    const [gstFile, setGstFile] = useState<File | null>(null);
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
    const [chequeFile, setChequeFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [uploadingKyc, setUploadingKyc] = useState(false);

    useEffect(() => {
        fetchProfileAndGSTData();
    }, [range]);

    const fetchProfileAndGSTData = async () => {
        try {
            setReportLoading(true);
            const [settingsRes, gstReportRes] = await Promise.all([
                axios.get('/seller/settings'),
                axios.get(`/seller/reports/gst?range=${range}`)
            ]);

            const profileData = settingsRes.data?.profile || {};
            setProfile(profileData);
            if (profileData.gst_number) {
                setGstin(profileData.gst_number);
                if (profileData.gstin_verified) {
                    setVerifiedData({
                        gstin: profileData.gst_number,
                        trade_name: profileData.brand_name || 'Verified Onboarded Vendor',
                        legal_name: profileData.account_holder_name || 'Verified Onboarded Entity',
                        state_code: profileData.gst_number.substring(0, 2),
                        status: 'Active',
                        taxpayer_type: 'Regular Taxpayer',
                        address: `${profileData.pickup_address_line_1 || ''}, ${profileData.pickup_address_city || ''}, ${profileData.pickup_address_state || ''} - ${profileData.pickup_address_pin_code || ''}`
                    });
                }
            }
            if (profileData.company_type) {
                setCompanyType(profileData.company_type);
            }

            setGstrReport(gstReportRes.data);
        } catch (error) {
            console.error('Failed to load GSTR compliance dashboard:', error);
            showToast('Failed to retrieve compliance records', 'error');
        } finally {
            setReportLoading(false);
        }
    };

    const handleVerifyGSTIN = async () => {
        if (!gstin.trim()) {
            showToast('Please input a valid GSTIN number first', 'error');
            return;
        }

        setVerificationLoading(true);
        try {
            const response = await axios.post('/seller/kyc/verify-gstin', { gstin: gstin.trim() });
            showToast('GSTIN verification completed successfully!', 'success');
            setVerifiedData(response.data.data);
            
            // Refresh settings/profile in background
            fetchProfileAndGSTData();
        } catch (error: any) {
            console.error('GSTIN Verification error:', error);
            showToast(error.response?.data?.message || 'GSTIN verification failed. Please check the syntax pattern.', 'error');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleUploadKYC = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadingKyc(true);

        try {
            const formData = new FormData();
            formData.append('company_type', companyType);
            
            if (panFile) formData.append('pan_image', panFile);
            if (gstFile) formData.append('gst_image', gstFile);
            if (aadhaarFile) formData.append('aadhaar_image', aadhaarFile);
            if (chequeFile) formData.append('cheque_image', chequeFile);
            if (signatureFile) formData.append('signature_image', signatureFile);

            await axios.post('/seller/settings/kyc', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            showToast('KYC document pack submitted for review!', 'success');
            setPanFile(null);
            setGstFile(null);
            setAadhaarFile(null);
            setChequeFile(null);
            setSignatureFile(null);
            
            fetchProfileAndGSTData();
        } catch (error: any) {
            console.error('KYC update failed:', error);
            showToast(error.response?.data?.message || 'Failed to dispatch KYC file attachments', 'error');
        } finally {
            setUploadingKyc(false);
        }
    };

    const handleDownloadGSTRCsv = () => {
        if (!gstrReport || !gstrReport.items || gstrReport.items.length === 0) {
            showToast('No transaction items to download', 'error');
            return;
        }

        const headers = ['Order Number', 'Product Name', 'Rate', 'Base Taxable (INR)', 'CGST (INR)', 'SGST (INR)', 'IGST (INR)', 'Total GST (INR)', 'Gross Sales (INR)', 'Date'];
        const rows = gstrReport.items.map((item: any) => [
            item.order_number,
            item.product_name,
            `${item.gst_slab}%`,
            item.base_price.toFixed(2),
            item.cgst.toFixed(2),
            item.sgst.toFixed(2),
            item.igst.toFixed(2),
            item.gst_amount.toFixed(2),
            item.net_amount.toFixed(2),
            item.created_at
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `GSTR-Report-${range}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('GSTR CSV Sheet downloaded successfully', 'success');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side: Compliance Registry & Verification */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* GSTIN Real-Time Verification */}
                <div className="premium-card p-6 bg-white rounded-2xl border-[0.5px] border-black/50 shadow-none space-y-6">
                    <div className="flex justify-between items-center border-b-[0.5px] border-black/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">GSTIN Registry Verification</h3>
                                <p className="text-xs text-gray-500 font-medium">Verify GSTIN compliance instantly</p>
                            </div>
                        </div>
                        {profile?.gstin_verified ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border-[0.5px] border-black/50 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                                <CheckCircle2 size={12} /> Verified Profile
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold border-[0.5px] border-black/50 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertCircle size={12} /> Verification Pending
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">GSTIN Number (15-digit)</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                placeholder="e.g. 08AAPCS1403F1ZW"
                                disabled={profile?.gstin_verified}
                                className="flex-1 h-11 px-4 rounded-xl border-[0.5px] border-black/50 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-green-600 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                            />
                            {!profile?.gstin_verified && (
                                <button
                                    onClick={handleVerifyGSTIN}
                                    disabled={verificationLoading || !gstin}
                                    className="px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-none hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:translate-y-0 border-black/50 border-[0.5px]"
                                >
                                    {verificationLoading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                    Verify
                                </button>
                            )}
                        </div>

                        {verifiedData && (
                            <div className="p-5 bg-emerald-50/20 border-[0.5px] border-black/50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                    <Building size={14} /> Registered Business Profile
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-650">
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold block leading-none mb-1">Legal Entity Name</span>
                                        <span className="text-gray-800 font-bold">{verifiedData.legal_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold block leading-none mb-1">Trade Brand Name</span>
                                        <span className="text-gray-800 font-bold">{verifiedData.trade_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold block leading-none mb-1">Taxpayer Category</span>
                                        <span className="text-gray-800 font-bold">{verifiedData.taxpayer_type}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold block leading-none mb-1">Filing Status</span>
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase inline-block">{verifiedData.status}</span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold block leading-none mb-1">Registered Address (State Code: {verifiedData.state_code})</span>
                                        <span className="text-gray-800 font-bold flex items-center gap-1.5"><MapPin size={12} className="text-emerald-600" /> {verifiedData.address}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* GSTR Sales Tax Ledger Reports */}
                <div className="premium-card p-6 bg-white rounded-2xl border-[0.5px] border-black/50 shadow-none space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-[0.5px] border-gray-55 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Calculator size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">GSTR Sales Ledger Summary</h3>
                                <p className="text-xs text-gray-500 font-medium font-semibold italic">Report window of delivered sales</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                                className="px-4 py-2 border-[0.5px] border-black/50 bg-white rounded-xl text-xs font-bold text-gray-700 shadow-none cursor-pointer outline-none appearance-none"
                            >
                                <option value="today">Today</option>
                                <option value="7_days">Last 7 Days</option>
                                <option value="30_days">Last 30 Days</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                                <option value="all_time">All Time</option>
                            </select>
                            <button
                                onClick={handleDownloadGSTRCsv}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition"
                                title="Download GSTR Sales Sheet (CSV)"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    {reportLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="animate-spin text-emerald-600" size={24} />
                        </div>
                    ) : gstrReport ? (
                        <div className="space-y-6">
                            
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border-[0.5px] border-black/50 text-left">
                                    <span className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">Taxable Subtotal</span>
                                    <span className="text-lg font-black text-gray-800">₹{(gstrReport.summary?.taxable_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border-[0.5px] border-black/50 text-left">
                                    <span className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">CGST Share</span>
                                    <span className="text-lg font-black text-gray-800">₹{(gstrReport.summary?.cgst || 0).toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border-[0.5px] border-black/50 text-left">
                                    <span className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">SGST Share</span>
                                    <span className="text-lg font-black text-gray-800">₹{(gstrReport.summary?.sgst || 0).toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border-[0.5px] border-black/50 text-left">
                                    <span className="text-[9.5px] uppercase font-bold text-gray-400 block mb-1">IGST Share</span>
                                    <span className="text-lg font-black text-gray-800">₹{(gstrReport.summary?.igst || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* GSTR Slab Matrix Table */}
                            <div className="border-[0.5px] border-black/50 rounded-2xl overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b-[0.5px] border-black/50 text-[10px] font-black uppercase text-gray-400 text-left">
                                    Tax Rate Slab Matrix
                                </div>
                                <table className="w-full text-xs font-semibold text-gray-650">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-[0.5px] border-black/50 text-gray-400 text-[10px] uppercase font-bold text-left">
                                            <th className="px-4 py-2.5">GST Slab</th>
                                            <th className="px-4 py-2.5">Taxable Base Amount</th>
                                            <th className="px-4 py-2.5">CGST</th>
                                            <th className="px-4 py-2.5">SGST</th>
                                            <th className="px-4 py-2.5">IGST</th>
                                            <th className="px-4 py-2.5">Total GST</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {gstrReport.by_slab?.map((slab: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 text-left text-gray-800">
                                                <td className="px-4 py-3 font-extrabold">{slab.gst_slab}%</td>
                                                <td className="px-4 py-3">₹{slab.taxable_amount.toFixed(2)}</td>
                                                <td className="px-4 py-3">₹{slab.cgst.toFixed(2)}</td>
                                                <td className="px-4 py-3">₹{slab.sgst.toFixed(2)}</td>
                                                <td className="px-4 py-3">₹{slab.igst.toFixed(2)}</td>
                                                <td className="px-4 py-3 font-bold text-emerald-650">₹{slab.gst_amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        {(!gstrReport.by_slab || gstrReport.by_slab.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-gray-400 italic">No sales transactions logged in this cycle</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No financial compliance records found.</p>
                    )}
                </div>
            </div>

            {/* Right Side: KYC Upload Pack */}
            <div className="space-y-8">
                
                {/* KYC Documents Panel */}
                <form onSubmit={handleUploadKYC} className="premium-card p-6 bg-white rounded-2xl border-[0.5px] border-black/50 shadow-none space-y-6">
                    <div className="flex items-center gap-3 border-b-[0.5px] border-black/50 pb-4">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">KYC Compliance Pack</h3>
                            <p className="text-xs text-gray-500 font-medium font-semibold italic">Upload verification archives</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-450 uppercase">Company structure Category</label>
                            <select
                                value={companyType}
                                onChange={(e) => setCompanyType(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl border-[0.5px] border-black/50 bg-white text-xs font-bold text-gray-700 shadow-none outline-none cursor-pointer"
                            >
                                <option value="Proprietorship">Individual / Proprietorship</option>
                                <option value="Partnership">Partnership Firm</option>
                                <option value="LLP">Limited Liability Partnership (LLP)</option>
                                <option value="Private Limited">Private Limited Company</option>
                                <option value="Public Limited">Public Limited Company</option>
                            </select>
                        </div>

                        {/* File Upload Grid */}
                        <div className="space-y-4 text-xs font-semibold text-gray-650">
                            
                            {/* PAN Image */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-450 uppercase">PAN Card Copy</label>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border-[0.5px] border-dashed border-black/50">
                                    <label className="px-3 py-1.5 bg-white border-[0.5px] border-black/50 rounded-lg text-[10px] font-extrabold cursor-pointer hover:border-gray-300 transition flex items-center gap-1.5">
                                        <Upload size={12} /> Choose File
                                        <input type="file" accept=".pdf,image/*" onChange={(e) => setPanFile(e.target.files?.[0] || null)} className="hidden" />
                                    </label>
                                    <span className="truncate flex-1 text-gray-500 text-[11px]">{panFile ? panFile.name : (profile?.pan_image_path ? '✓ Onboarded copy' : 'No file selected')}</span>
                                </div>
                            </div>

                            {/* GST Certificate */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-450 uppercase">GST Certificate copy</label>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border-[0.5px] border-dashed border-black/50">
                                    <label className="px-3 py-1.5 bg-white border-[0.5px] border-black/50 rounded-lg text-[10px] font-extrabold cursor-pointer hover:border-gray-300 transition flex items-center gap-1.5">
                                        <Upload size={12} /> Choose File
                                        <input type="file" accept=".pdf,image/*" onChange={(e) => setGstFile(e.target.files?.[0] || null)} className="hidden" />
                                    </label>
                                    <span className="truncate flex-1 text-gray-500 text-[11px]">{gstFile ? gstFile.name : (profile?.gst_image_path ? '✓ Onboarded copy' : 'No file selected')}</span>
                                </div>
                            </div>

                            {/* Aadhaar Card */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-450 uppercase">Aadhaar Card Copy</label>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border-[0.5px] border-dashed border-black/50">
                                    <label className="px-3 py-1.5 bg-white border-[0.5px] border-black/50 rounded-lg text-[10px] font-extrabold cursor-pointer hover:border-gray-300 transition flex items-center gap-1.5">
                                        <Upload size={12} /> Choose File
                                        <input type="file" accept=".pdf,image/*" onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)} className="hidden" />
                                    </label>
                                    <span className="truncate flex-1 text-gray-500 text-[11px]">{aadhaarFile ? aadhaarFile.name : (profile?.aadhaar_image_path ? '✓ Onboarded copy' : 'No file selected')}</span>
                                </div>
                            </div>

                            {/* Cancelled Cheque */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-450 uppercase">Cancelled Cheque copy</label>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border-[0.5px] border-dashed border-black/50">
                                    <label className="px-3 py-1.5 bg-white border-[0.5px] border-black/50 rounded-lg text-[10px] font-extrabold cursor-pointer hover:border-gray-300 transition flex items-center gap-1.5">
                                        <Upload size={12} /> Choose File
                                        <input type="file" accept=".pdf,image/*" onChange={(e) => setChequeFile(e.target.files?.[0] || null)} className="hidden" />
                                    </label>
                                    <span className="truncate flex-1 text-gray-500 text-[11px]">{chequeFile ? chequeFile.name : (profile?.cheque_image_path ? '✓ Onboarded copy' : 'No file selected')}</span>
                                </div>
                            </div>

                            {/* Authorized Signature */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-450 uppercase">Authorized Signature (Png / Scan)</label>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border-[0.5px] border-dashed border-black/50">
                                    <label className="px-3 py-1.5 bg-white border-[0.5px] border-black/50 rounded-lg text-[10px] font-extrabold cursor-pointer hover:border-gray-300 transition flex items-center gap-1.5">
                                        <Upload size={12} /> Choose File
                                        <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} className="hidden" />
                                    </label>
                                    <span className="truncate flex-1 text-gray-500 text-[11px]">{signatureFile ? signatureFile.name : (profile?.signature_image_path ? '✓ Onboarded copy' : 'No file selected')}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploadingKyc || (!panFile && !gstFile && !aadhaarFile && !chequeFile && !signatureFile)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-none hover:-translate-y-0.5 active:scale-95 transition-all disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none disabled:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 border-black/50 border-[0.5px]"
                    >
                        {uploadingKyc ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                        Submit KYC Documents
                    </button>
                </form>

                {/* Tax slabs guidelines card */}
                <div className="premium-card p-6 bg-[#E8F8EE] rounded-2xl border-[0.5px] border-black/50 text-left space-y-4">
                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                        <Calculator size={14} /> Marketplace GST Slab Rules
                    </h4>
                    <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
                        Sellers must set appropriate GST slabs (0%, 5%, 12%, 18%, 28%) for every product matching the HSN code class. Product prices are inclusive of taxes. Invoices will automatically detail CGST, SGST, or IGST dynamically.
                    </p>
                </div>
            </div>

        </div>
    );
}
