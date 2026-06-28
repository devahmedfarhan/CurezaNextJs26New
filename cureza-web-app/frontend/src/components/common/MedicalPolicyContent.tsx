'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/api';
import { 
    ShieldAlert, 
    FileText, 
    Stethoscope, 
    HelpCircle, 
    Info, 
    CheckCircle, 
    AlertOctagon,
    AlertTriangle,
    DollarSign,
    ChevronRight,
    Loader2
} from 'lucide-react';
import dynamicPolicy from '@/data/legal-pages/medical-product-policy.json';

export default function MedicalPolicyContent() {
    const [brands, setBrands] = useState<string[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(true);

    useEffect(() => {
        const fetchDynamicRxBrands = async () => {
            try {
                // Fetch all published products to see which brands provide Rx/CBD medicines
                const res = await axios.get('/products');
                if (res.data && Array.isArray(res.data)) {
                    // Filter products requiring prescription (Rx/CBD/Vijaya medicines)
                    const rxProducts = res.data.filter((p: any) => p.is_prescription_required);
                    // Extract unique active brand names
                    const brandNames = Array.from(
                        new Set(rxProducts.map((p: any) => p.brand?.name).filter(Boolean))
                    ) as string[];
                    setBrands(brandNames);
                }
            } catch (error) {
                console.error("Failed to load dynamic medicine brands:", error);
            } finally {
                setLoadingBrands(false);
            }
        };

        fetchDynamicRxBrands();
    }, []);

    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
    };

    return (
        <div className="bg-[#F8F3EF] min-h-screen py-12 text-[#052326]">
            {/* Standard responsive container for alignment */}
            <div className="container mx-auto px-4 md:px-6">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[#052326]/60 mb-6 tracking-wider">
                    <Link href="/" className="hover:text-[#052326] transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#052326]">Medical Product Policy</span>
                </div>

                {/* Hero / Header Section - Inside container layout */}
                <div style={{ ...cardStyle, border: 'none' }} className="bg-gradient-to-br from-[#052326] to-[#0b3c41] text-white p-8 md:p-12 mb-10 relative overflow-hidden w-full">
                    {/* Abstract background design element */}
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
                        <ShieldAlert size={260} />
                    </div>

                    <div className="relative z-10 space-y-4 max-w-4xl">
                        <span className="inline-block bg-[#F0C417] text-[#052326] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider">
                            Schedule E-1 Rx Guidelines
                        </span>
                        <h1 className="text-3xl md:text-5xl font-semibold font-heading tracking-tight leading-tight">
                            {dynamicPolicy ? dynamicPolicy.title : 'Cureza RX Medication Policy'}
                        </h1>
                        <p className="text-sm md:text-base text-white/80 leading-relaxed font-light">
                            {dynamicPolicy?.description || 'Welcome to Cureza, a wellness & holistic Vijaya medication marketplace. Please review our compliance framework, medical supervision guidelines, and prescription standards.'}
                        </p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content Areas */}
                    <div className="lg:col-span-2 space-y-8">
                        {dynamicPolicy ? (
                            <div style={cardStyle} className="bg-white p-6 md:p-8">
                                <div 
                                    className="prose prose-sm sm:prose max-w-none text-[#052326]/80 leading-relaxed dynamic-legal-content"
                                    dangerouslySetInnerHTML={{ __html: dynamicPolicy.content }} 
                                />
                            </div>
                        ) : (
                            <>
                                {/* 1. Dynamic Brand/Seller Registry Section */}
                                <div style={cardStyle} className="bg-white p-6 md:p-8 space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2.5">
                                        <span className="p-2 rounded-[8px] bg-[#052326]/5 text-[#052326] border border-[rgba(85,85,85,0.08)]">
                                            <CheckCircle size={20} />
                                        </span>
                                        Cureza Group of Brands (CGB)
                                    </h2>
                                    <p className="text-sm text-[#052326]/70 leading-relaxed font-light">
                                        Cureza Group of Brands (CGB) Rx medicines contain premium cannabis leaf-based formulations. Cannabis is featured in classical formulations in the Ayurvedic Pharmacopeia as <strong>'Vijaya'</strong>, as part of the Traditional Remedies of India.
                                    </p>
                                    
                                    <div>
                                        <h3 className="text-xs font-semibold tracking-wider text-[#052326]/60 mb-3">
                                            Our Active Rx & Medicine Brands
                                        </h3>
                                        {loadingBrands ? (
                                            <div className="flex items-center gap-2 text-sm text-[#052326]/50 py-3">
                                                <Loader2 className="animate-spin" size={16} />
                                                <span>Retrieving active medicine vendors...</span>
                                            </div>
                                        ) : brands.length === 0 ? (
                                            <div className="text-sm text-[#052326]/50 py-3 italic">
                                                No registered Rx medicine brands found currently.
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {brands.map((brand, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className="bg-[#F8F3EF] hover:bg-[#052326]/10 text-xs font-semibold px-4 py-2 rounded-full border border-[#052326]/8 transition-colors cursor-default"
                                                    >
                                                        {brand}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Medical Supervision & Schedule E-1 */}
                                <div style={cardStyle} className="bg-white p-6 md:p-8 space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2.5">
                                        <span className="p-2 rounded-[8px] bg-[#052326]/5 text-[#052326] border border-[rgba(85,85,85,0.08)]">
                                            <FileText size={20} />
                                        </span>
                                        Supervision & Prescription Requirement
                                    </h2>
                                    <p className="text-sm text-[#052326]/70 leading-relaxed font-light">
                                        Cannabis falls under <strong>Schedule E-1 of The Drugs and Cosmetics Rules, 1945</strong>. As per law, any consumable medicine containing Schedule E-1 substances must be taken under medical supervision only.
                                    </p>
                                    <div className="bg-[#052326]/5 p-4 rounded-[8px] border-l-4 border-[#052326] text-xs space-y-2">
                                        <p className="font-semibold">Important Dispatch Requirement:</p>
                                        <p className="text-[#052326]/80 leading-relaxed font-light">
                                            A supporting prescription is proof that the medicine will be consumed following due medical diligence. We only initiate shipping of consumable medical products after receiving and verifying a valid prescription corresponding to your order.
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Medical Experts Panel */}
                                <div style={cardStyle} className="bg-white p-6 md:p-8 space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2.5">
                                        <span className="p-2 rounded-[8px] bg-[#052326]/5 text-[#052326] border border-[rgba(85,85,85,0.08)]">
                                            <Stethoscope size={20} />
                                        </span>
                                        Consultation & Expert Medical Panel
                                    </h2>
                                    <p className="text-sm text-[#052326]/70 leading-relaxed font-light">
                                        We maintain a dedicated team consisting of doctors, a quality analyst, and a compliance officer to monitor active practitioners in our medical panel. This ensures accountability for the medical purpose and safe use of formulations.
                                    </p>
                                    <p className="text-sm text-[#052326]/70 leading-relaxed font-light">
                                        Our Medical Experts Panel consists of independent service providers who are not directly affiliated with Cureza. While we facilitate consultations for your convenience, we do not earn referral fees. We encourage all patients to perform their own due diligence or consult their regular doctors.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="p-4 rounded-[8px] bg-[#F8F3EF] border border-[#052326]/6 space-y-1">
                                            <h4 className="text-xs font-semibold text-[#052326]">Prescription Validity</h4>
                                            <p className="text-xs text-[#052326]/70 font-light leading-relaxed">
                                                Any prescription generated through our internal or external doctor networks is valid for exactly <strong>120 days</strong> from the date of issue.
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-[8px] bg-[#F8F3EF] border border-[#052326]/6 space-y-1">
                                            <h4 className="text-xs font-semibold text-[#052326]">Data & Health Sharing</h4>
                                            <p className="text-xs text-[#052326]/70 font-light leading-relaxed">
                                                Doctors share your medical history and prescription details with us to facilitate order dispatch. This data is protected as per our Privacy Policy.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Ayurvedic Efficacy & Research Disclaimer */}
                                <div style={cardStyle} className="bg-white p-6 md:p-8 space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2.5">
                                        <span className="p-2 rounded-[8px] bg-[#052326]/5 text-[#052326] border border-[rgba(85,85,85,0.08)]">
                                            <HelpCircle size={20} />
                                        </span>
                                        Efficacy & Research Disclaimer
                                    </h2>
                                    <p className="text-sm text-[#052326]/70 leading-relaxed font-light">
                                        This is an Ayurvedic medicine. The efficacy of the medicine has not been independently confirmed. Constant research is ongoing globally to discover new properties, as well as the long-term and short-term effects of traditional medicine systems.
                                    </p>
                                    <p className="text-xs text-[#052326]/50 italic">
                                        * Information on this website is for general educational and informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar - Restrictions, Payments, and Verification */}
                    <div className="space-y-6">
                        
                        {/* Strict Safety warnings card */}
                        <div style={cardStyle} className="bg-[#DF5252]/10 p-6 space-y-4 border-[#DF5252]/20">
                            <h3 className="text-base font-semibold text-[#DF5252] flex items-center gap-2">
                                <AlertOctagon size={20} />
                                Critical Warnings
                            </h3>
                            <div className="space-y-3.5 text-xs text-[#052326]">
                                <div className="flex gap-2 items-start bg-white/50 p-2.5 rounded-[8px] border-l-2 border-[#DF5252]">
                                    <AlertTriangle size={16} className="text-[#DF5252] shrink-0 mt-0.5" />
                                    <p className="font-semibold tracking-wide">Do not consume if pregnant or breastfeeding.</p>
                                </div>
                                <div className="flex gap-2 items-start bg-white/50 p-2.5 rounded-[8px] border-l-2 border-[#DF5252]">
                                    <AlertTriangle size={16} className="text-[#DF5252] shrink-0 mt-0.5" />
                                    <p className="font-light">Do not consume if you suffer from <strong>Glaucoma</strong> or <strong>severe liver issues</strong>.</p>
                                </div>
                                <div className="flex gap-2 items-start bg-white/50 p-2.5 rounded-[8px] border-l-2 border-[#DF5252]">
                                    <AlertTriangle size={16} className="text-[#DF5252] shrink-0 mt-0.5" />
                                    <p className="font-light">Do not consume if you have <strong>very low blood pressure</strong>.</p>
                                </div>
                                <div className="flex gap-2 items-start bg-white/50 p-2.5 rounded-[8px] border-l-2 border-[#DF5252]">
                                    <AlertTriangle size={16} className="text-[#DF5252] shrink-0 mt-0.5" />
                                    <p className="font-light"><strong>Impairment Alert:</strong> Consumption may impair your ability to drive or operate machinery. Do not handle sharp or dangerous objects after use.</p>
                                </div>
                            </div>
                        </div>

                        {/* Dispatch & Age gate */}
                        <div style={{ ...cardStyle, border: 'none', backgroundColor: '#052326' }} className="text-white p-6 space-y-4">
                            <h3 className="text-base font-semibold text-[#F0C417] flex items-center gap-2">
                                <Info size={18} />
                                Shipping & Dispatch
                            </h3>
                            <div className="space-y-3 text-xs leading-relaxed font-light text-white/80">
                                <p>
                                    All orders are subject to internal prescription verification. Verification and validation usually take up to <strong>2-3 working days</strong> prior to dispatch.
                                </p>
                                <p>
                                    <strong>Age Requirement:</strong> You must be <strong>18 years of age or older</strong> to purchase. Cash on Delivery (COD) is disabled for all Rx medicine purchases to enforce online verification.
                                </p>
                            </div>
                        </div>

                        {/* Payment & Refund Terms */}
                        <div style={cardStyle} className="bg-white p-6 space-y-4">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                                <DollarSign size={18} className="text-[#052326]" />
                                Payment & Refund Terms
                            </h3>
                            <div className="space-y-3.5 text-xs">
                                <div className="space-y-1.5 p-3 rounded-[8px] bg-green-50 border border-green-200">
                                    <h4 className="font-semibold text-green-800">100% Refund Guarantee</h4>
                                    <p className="text-green-700 leading-relaxed font-light">
                                        If you consult our Medical Experts Panel but do not receive a prescription, you are eligible for a <strong>100% refund</strong> or a store-wide credit voucher valid for 1 year.
                                    </p>
                                </div>
                                <div className="space-y-1.5 p-3 rounded-[8px] bg-orange-50 border border-orange-200">
                                    <h4 className="font-semibold text-orange-800">External Prescriptions</h4>
                                    <p className="text-orange-700 leading-relaxed font-light">
                                        If you submit a prescription from an external doctor that does not clear our compliance check, a refund is <strong>not issued</strong>, but you will receive store credit valid for 1 year.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Footer disclaimer back button */}
                <div className="mt-12 pt-6 pb-6 border-t border-[#052326]/12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#052326]/60">
                    <p>© {new Date().getFullYear()} Cureza Wellness Pvt Ltd. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/" className="hover:underline font-semibold text-[#052326]">Back to Home</Link>
                        <span className="text-[#052326]/30">|</span>
                        <Link href="/faq" className="hover:underline font-semibold text-[#052326]">FAQs</Link>
                        <span className="text-[#052326]/30">|</span>
                        <Link href="/contact" className="hover:underline font-semibold text-[#052326]">Contact Support</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
