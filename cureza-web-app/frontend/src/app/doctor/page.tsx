'use client';

import { useState, useEffect } from 'react';
import { Star, Video, Calendar, Clock, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DoctorPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Booking Modal State
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [bookingData, setBookingData] = useState({
        appointment_date: '',
        notes: ''
    });
    const [bookingLoading, setBookingLoading] = useState(false);

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

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* ... hero and filters remain same ... */}
            <section className="bg-trust-blue text-white rounded-2xl p-8 md:p-16 mb-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Video size={120} />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-6">Consult Top Ayurvedic Doctors</h1>
                <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                    Get personalized health advice, diet plans, and prescriptions from verified practitioners via video call.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button variant="secondary" size="lg" className="font-bold">
                        Find a Doctor
                    </Button>
                    <Button variant="outline" size="lg" className="bg-blue-700/50 text-white border-blue-500 font-bold hover:bg-blue-600">
                        How it Works
                    </Button>
                </div>
            </section>

            <div className="mb-8 space-y-4">
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by name or specialty..."
                        className="pl-10 h-12 rounded-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                    {['All Specialists', 'General Physician', 'Skin & Hair', 'Digestion', 'Stress', 'Women\'s Health'].map((filter, idx) => (
                        <button key={idx} className={`px-6 py-2 rounded-full whitespace-nowrap border text-sm font-medium transition ${idx === 0 ? 'bg-trust-blue text-white border-trust-blue' : 'bg-background text-muted-foreground border-border hover:border-trust-blue'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-muted-foreground">Loading doctors...</div>
            ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border rounded-xl bg-muted/20">No doctors found matching your criteria.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all p-6 flex flex-col">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-20 h-20 bg-muted rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl border">
                                    {doctor.profile_photo_url ? (
                                        <Image src={doctor.profile_photo_url} alt={doctor.name} width={80} height={80} className="object-cover h-full w-full" />
                                    ) : '👨‍⚕️'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-foreground">{doctor.name}</h3>
                                    <p className="text-primary text-sm font-medium mb-1">{doctor.specialization}</p>
                                    <p className="text-muted-foreground text-xs mb-2">{doctor.years_of_experience}+ Years Experience</p>
                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold w-max">
                                        {doctor.rating ? Number(doctor.rating).toFixed(1) : '0.0'} <Star size={10} fill="currentColor" className="inline ml-0.5" />
                                        <span className="text-slate-400 text-[10px] font-normal ml-1">({doctor.reviews_count || 0})</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 flex-1">
                                {(doctor.languages_spoken || []).slice(0, 3).map((lang: string) => (
                                    <span key={lang} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded uppercase font-bold tracking-tight">
                                        {lang}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Consultation Fee</p>
                                    <p className="font-bold text-lg">₹{doctor.consultation_fee || '499'}</p>
                                </div>
                                <Button className="bg-trust-blue hover:bg-blue-700 gap-2" onClick={() => handleBookNow(doctor)}>
                                    <Calendar size={16} /> Book Now
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

