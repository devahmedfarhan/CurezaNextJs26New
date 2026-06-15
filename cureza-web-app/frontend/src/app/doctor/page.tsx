'use client';

import { useState, useEffect } from 'react';
import { Star, Video, Calendar, Clock, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DoctorPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSpecialty, setActiveSpecialty] = useState('All Specialists');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/public/doctors');
            setDoctors(response.data);
        } catch (error) {
            showToast('Failed to load doctors', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (doctor: any) => {
        router.push(`/consultation/book/${doctor.id}`);
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeSpecialty === 'All Specialists') {
            return matchesSearch;
        }
        
        // Custom matching logic for specialty filters
        const spec = doctor.specialization.toLowerCase();
        const active = activeSpecialty.toLowerCase();
        
        if (active === 'general physician') {
            return matchesSearch && (spec.includes('general') || spec.includes('physician'));
        }
        if (active === 'skin & hair') {
            return matchesSearch && (spec.includes('skin') || spec.includes('hair') || spec.includes('dermat'));
        }
        if (active === 'digestion') {
            return matchesSearch && (spec.includes('digest') || spec.includes('gut') || spec.includes('gastro'));
        }
        if (active === 'stress') {
            return matchesSearch && (spec.includes('stress') || spec.includes('anxiety') || spec.includes('mental'));
        }
        if (active === "women's health") {
            return matchesSearch && (spec.includes('women') || spec.includes('gynae'));
        }
        
        return matchesSearch && spec.includes(active);
    });

    const specialties = [
        'All Specialists',
        'General Physician',
        'Skin & Hair',
        'Digestion',
        'Stress',
        "Women's Health"
    ];

    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-4 md:px-8 lg:px-12">
            {/* Editorial Header Section */}
            <section className="bg-[#052326] text-[#F8F3EF] rounded-[14px] p-8 md:p-16 mb-12 text-center relative overflow-hidden shadow-premium-deep border border-[#F8F3EF]/10">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Video size={160} />
                </div>
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#F0C417] uppercase block mb-3">
                    Premium Telehealth Platform
                </span>
                <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 tracking-tight max-w-3xl mx-auto">
                    Consult Top Certified Ayurvedic Doctors
                </h1>
                <p className="text-[#F8F3EF]/80 text-sm md:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
                    Receive personalized clinical wellness evaluations, customized dosage guidelines, and certified digital prescriptions from vetted practitioners via secure video consultations.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                        onClick={() => {
                            const el = document.getElementById('doctor-grid');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#F0C417] text-[#052326] hover:bg-[#F0C417]/90 font-bold px-8 h-12 rounded-[10px] text-xs uppercase tracking-wider transition-all"
                    >
                        Find a Doctor
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/about')}
                        className="bg-transparent text-[#F8F3EF] border-[#F8F3EF]/30 hover:bg-[#F8F3EF]/10 font-bold px-8 h-12 rounded-[10px] text-xs uppercase tracking-wider transition-all"
                    >
                        How it Works
                    </Button>
                </div>
                
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold capitalize tracking-wider text-[#F8F3EF]/70">
                    <span>Are you a clinical practitioner?</span>
                    <button 
                        onClick={() => router.push('/doctor/login')} 
                        className="text-[#F0C417] hover:text-[#F0C417]/85 font-bold transition-colors underline underline-offset-4 capitalize tracking-wider"
                    >
                        Doctor Login
                    </button>
                    <span>•</span>
                    <button 
                        onClick={() => router.push('/doctor/register')} 
                        className="text-[#F0C417] hover:text-[#F0C417]/85 font-bold transition-colors underline underline-offset-4 capitalize tracking-wider"
                    >
                        Register Now
                    </button>
                </div>
            </section>

            {/* Filter & Search Bar Section */}
            <div className="mb-12 space-y-6 max-w-4xl mx-auto">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#052326]/50 h-5 w-5" />
                    <Input
                        placeholder="Search by practitioner name or medical specialty..."
                        className="pl-12 h-14 rounded-[12px] border-[#052326]/12 bg-white text-sm focus:ring-2 focus:ring-[#052326]/20 placeholder-[#052326]/40 shadow-premium-light"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* Horizontal Specialty Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide justify-start md:justify-center">
                    {specialties.map((filter) => {
                        const isActive = activeSpecialty === filter;
                        return (
                            <button
                                key={filter}
                                onClick={() => setActiveSpecialty(filter)}
                                className={`px-5 py-2.5 rounded-[10px] whitespace-nowrap border text-xs font-semibold uppercase tracking-wider transition-all duration-200 select-none ${
                                    isActive
                                        ? 'bg-[#052326] text-[#F8F3EF] border-[#052326] shadow-sm'
                                        : 'bg-white text-[#052326]/70 border-[#052326]/12 hover:border-[#052326]/30 hover:bg-[#F8F3EF]/30'
                                }`}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Doctor Cards Grid */}
            <div id="doctor-grid" className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-24 text-sm text-[#052326]/50 font-light">Loading clinical practitioners...</div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="text-center py-20 border border-[#052326]/12 rounded-[14px] bg-white shadow-premium-light max-w-2xl mx-auto">
                        <p className="text-sm text-[#052326]/60 font-light">No doctors found matching your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map((doctor) => (
                            <div 
                                key={doctor.id} 
                                className="bg-white rounded-[12px] border border-[#052326]/12 shadow-premium-light hover:shadow-premium-hover transition-all duration-300 p-6 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-[#052326]/5 rounded-[12px] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#052326]/12">
                                            {doctor.profile_photo_url ? (
                                                <Image src={doctor.profile_photo_url} alt={doctor.name} width={64} height={64} className="object-cover h-full w-full" />
                                            ) : (
                                                <span className="text-2xl">👨‍⚕️</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-base text-[#052326] truncate">{doctor.name}</h3>
                                            <p className="text-[#052326]/60 text-xs font-medium uppercase tracking-wider mt-0.5">{doctor.specialization}</p>
                                            <p className="text-[#052326]/40 text-[10px] mt-1 font-light">{doctor.years_of_experience}+ Years Experience</p>
                                        </div>
                                    </div>

                                    {/* Rating badge */}
                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-[6px] text-xs font-bold w-max mb-4">
                                        <span>{doctor.rating ? Number(doctor.rating).toFixed(1) : '0.0'}</span>
                                        <Star size={11} fill="currentColor" className="text-emerald-700" />
                                        <span className="text-[#052326]/40 text-[10px] font-normal ml-1">({doctor.reviews_count || 0} reviews)</span>
                                    </div>

                                    {/* Languages Spoken */}
                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                        {(doctor.languages_spoken || []).slice(0, 3).map((lang: string) => (
                                            <span key={lang} className="text-[9px] font-bold uppercase tracking-wider bg-[#052326]/5 text-[#052326]/60 px-2 py-0.5 rounded-[4px]">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-[#052326]/8 pt-4 gap-3">
                                    <div>
                                        <p className="text-[9px] text-[#052326]/40 uppercase font-bold tracking-wider">Fee</p>
                                        <p className="font-bold text-sm text-[#052326]">₹{doctor.consultation_fee || '499'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline"
                                            onClick={() => router.push(`/doctor/${doctor.id}`)}
                                            className="border-[#052326]/20 text-[#052326] hover:bg-[#052326]/5 px-3 h-9 rounded-[10px] text-[10px] font-bold uppercase tracking-wider transition-all"
                                        >
                                            View Profile
                                        </Button>
                                        <Button 
                                            onClick={() => handleBookNow(doctor)}
                                            className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 gap-1.5 px-3 h-9 rounded-[10px] text-[10px] font-bold uppercase tracking-wider transition-all"
                                        >
                                            <Calendar size={11} /> Book
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
