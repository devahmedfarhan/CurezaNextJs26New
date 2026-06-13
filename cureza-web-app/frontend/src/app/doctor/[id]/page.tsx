'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Video, Calendar, MapPin, Award, BookOpen, Languages, ShieldCheck, ArrowLeft, Heart } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from "@/components/ui/button";

export default function PublicDoctorProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const id = params.id;

    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDoctorDetails();
        }
    }, [id]);

    const fetchDoctorDetails = async () => {
        try {
            const response = await api.get(`/public/doctors/${id}`);
            setDoctor(response.data);
        } catch (error) {
            showToast('Failed to load practitioner profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F3EF] flex flex-col items-center justify-center py-20">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-[#052326]/10 rounded-full"></div>
                    <p className="text-sm font-semibold text-[#052326]/60">Loading clinician credentials...</p>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-[#F8F3EF] py-12 px-6 flex flex-col items-center justify-center text-center">
                <span className="text-4xl mb-4">🩺</span>
                <h2 className="text-2xl font-bold text-[#052326] font-serif mb-2">Practitioner Profile Not Found</h2>
                <p className="text-gray-500 text-sm max-w-sm mb-6">The requested doctor profile might be suspended, pending approval, or does not exist.</p>
                <Button onClick={() => router.push('/doctor')} className="bg-[#052326] text-white hover:bg-[#052326]/90 rounded-[10px]">
                    Back to Directory
                </Button>
            </div>
        );
    }

    // Limit bio description to 250 characters unless expanded
    const bioText = doctor.bio || 'No professional biography provided yet.';
    const displayBio = isBioExpanded ? bioText : `${bioText.slice(0, 250)}${bioText.length > 250 ? '...' : ''}`;

    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-4 md:px-8 lg:px-16">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Back Link */}
                <button 
                    onClick={() => router.push('/doctor')} 
                    className="flex items-center gap-2 text-[#052326]/60 hover:text-[#052326] text-xs font-semibold uppercase tracking-wider transition-all"
                >
                    <ArrowLeft size={14} /> Back to Doctor Directory
                </button>

                {/* Profile Main Editorial Box */}
                <div className="bg-white border border-[#052326]/12 rounded-[14px] p-6 md:p-10 shadow-premium-light relative overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        
                        {/* Profile Image & Rating */}
                        <div className="flex flex-col items-center space-y-4 flex-shrink-0 w-full md:w-auto">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[12px] overflow-hidden border border-[#052326]/12 bg-[#052326]/5 flex items-center justify-center">
                                {doctor.profile_photo_url ? (
                                    <img src={doctor.profile_photo_url} alt={doctor.name} className="object-cover w-full h-full" />
                                ) : (
                                    <span className="text-5xl">👨‍⚕️</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-[6px] text-sm font-bold shadow-sm">
                                <span>{doctor.rating ? Number(doctor.rating).toFixed(1) : '0.0'}</span>
                                <Star size={12} fill="currentColor" className="text-emerald-700" />
                                <span className="text-[#052326]/40 text-[10px] font-normal">({doctor.reviews_count || 0} Reviews)</span>
                            </div>
                        </div>

                        {/* Profile Head Details */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#052326]">{doctor.name}</h1>
                                        <div className="flex items-center gap-1 bg-[#052326]/10 text-[#052326] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            <ShieldCheck size={12} /> Verified Expert
                                        </div>
                                    </div>
                                    <p className="text-[#052326]/60 text-sm font-semibold uppercase tracking-wider mt-1">{doctor.specialization}</p>
                                    <p className="text-[#052326]/40 text-xs mt-1 font-light">{doctor.years_of_experience}+ Years of Medical Experience</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block">Consultation Fee</span>
                                    <span className="text-2xl font-bold text-[#052326]">₹{doctor.consultation_fee || '499'}</span>
                                </div>
                            </div>

                            {/* Medical Council Points / Verification Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F8F3EF]/50 p-4 rounded-[10px] border border-[#052326]/5 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block">Council Registration No.</span>
                                    <span className="font-mono font-bold text-[#052326]">{doctor.medical_license_number || 'REG-PENDING'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block">Registered State Council</span>
                                    <span className="font-semibold text-[#052326]">{doctor.medical_council_name || 'Ayush Medical Board'}</span>
                                </div>
                            </div>

                            {/* Bio Description with limited content constraint */}
                            <div className="text-gray-700 text-sm leading-relaxed space-y-2">
                                <p>{displayBio}</p>
                                {bioText.length > 250 && (
                                    <button 
                                        onClick={() => setIsBioExpanded(!isBioExpanded)}
                                        className="text-[#052326] font-bold hover:underline text-xs uppercase tracking-wider mt-1 block"
                                    >
                                        {isBioExpanded ? 'Read Less' : 'Read More Biography'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid layout for Credentials & Clinic Map details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Qualification & Skills Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Professional Qualifications */}
                        <div className="bg-white border border-[#052326]/12 rounded-[14px] p-6 space-y-4 shadow-premium-light">
                            <h3 className="font-bold text-base text-[#052326] flex items-center gap-2 border-b border-[#052326]/10 pb-3">
                                <Award size={18} /> Education & Specializations
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block">Highest Qualification</span>
                                    <span className="font-bold text-[#052326]">{doctor.highest_qualification || 'Degree Certified'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block">Medical School & Institutions</span>
                                    <span className="font-semibold text-gray-700">{doctor.medical_school || 'Verified Medical Institution'}</span>
                                </div>
                                {doctor.secondary_specializations && doctor.secondary_specializations.length > 0 && (
                                    <div>
                                        <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block mb-1">Secondary Fields</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {doctor.secondary_specializations.map((spec: string) => (
                                                <span key={spec} className="px-2 py-0.5 rounded-[4px] bg-[#052326]/5 text-[#052326]/60 text-[10px] font-bold uppercase tracking-wider">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Areas of Expertise */}
                        {(doctor.areas_of_expertise || doctor.treatable_conditions) && (
                            <div className="bg-white border border-[#052326]/12 rounded-[14px] p-6 space-y-4 shadow-premium-light">
                                <h3 className="font-bold text-base text-[#052326] flex items-center gap-2 border-b border-[#052326]/10 pb-3">
                                    <BookOpen size={18} /> Expertise & Conditions Treated
                                </h3>
                                <div className="space-y-4">
                                    {doctor.areas_of_expertise && doctor.areas_of_expertise.length > 0 && (
                                        <div>
                                            <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block mb-1">Areas of Expertise</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {doctor.areas_of_expertise.map((exp: string) => (
                                                    <span key={exp} className="px-2.5 py-1 rounded-[6px] border border-[#052326]/12 bg-[#F8F3EF]/30 text-[#052326] text-xs font-medium">
                                                        {exp}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {doctor.treatable_conditions && doctor.treatable_conditions.length > 0 && (
                                        <div>
                                            <span className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-wider block mb-1">Treatable Conditions</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {doctor.treatable_conditions.map((cond: string) => (
                                                    <span key={cond} className="px-2.5 py-1 rounded-[6px] border border-dashed border-[#052326]/15 bg-[#F8F3EF]/30 text-[#052326] text-xs font-medium">
                                                        {cond}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Booking, Clinic details & Languages */}
                    <div className="space-y-6">
                        
                        {/* Book slot Call to action */}
                        <div className="bg-[#052326] text-white p-6 rounded-[14px] shadow-premium-deep text-center space-y-4">
                            <Video className="mx-auto h-8 w-8 text-[#F0C417] animate-pulse" />
                            <h4 className="font-bold font-serif text-lg">Secure Telehealth Consultation</h4>
                            <p className="text-white/80 text-xs leading-relaxed font-light">
                                Connect virtually over high-quality video call. Receive certified digital prescriptions and dosage plans.
                            </p>
                            <Button 
                                onClick={() => router.push(`/consultation/book/${doctor.id}`)}
                                className="w-full bg-[#F0C417] text-[#052326] hover:bg-[#F0C417]/95 font-bold h-11 rounded-[10px] text-xs uppercase tracking-wider shadow-sm transition-all"
                            >
                                <Calendar size={13} className="mr-1.5" /> Book Session Now
                            </Button>
                        </div>

                        {/* Available slots / Clinic summary */}
                        <div className="bg-white border border-[#052326]/12 rounded-[14px] p-6 space-y-4 shadow-premium-light text-sm">
                            <div>
                                <h5 className="font-bold text-[#052326] flex items-center gap-1.5 mb-2">
                                    <MapPin size={15} /> Clinic Location
                                </h5>
                                <p className="font-semibold text-xs text-[#052326]">{doctor.clinic_name || 'General Clinic Office'}</p>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{doctor.clinic_address || 'Consultation Clinic Suite'}</p>
                                {doctor.clinic_city && <p className="text-gray-400 text-xs mt-0.5">{doctor.clinic_city}</p>}
                                {doctor.google_map_link && (
                                    <a 
                                        href={doctor.google_map_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[#052326] font-bold text-xs uppercase tracking-wider block mt-2 hover:underline"
                                    >
                                        Open in Google Maps
                                    </a>
                                )}
                            </div>

                            <Separator className="bg-[#052326]/8" />

                            <div>
                                <h5 className="font-bold text-[#052326] flex items-center gap-1.5 mb-2">
                                    <Languages size={15} /> Languages
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                    {(doctor.languages_spoken || ['English']).map((lang: string) => (
                                        <span key={lang} className="text-[9px] font-bold uppercase tracking-wider bg-[#052326]/5 text-[#052326]/60 px-2.5 py-1 rounded-[4px]">
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

// Simple Separator Component
function Separator({ className }: { className?: string }) {
    return <div className={`h-[1px] w-full ${className || 'bg-gray-200'}`} />;
}
