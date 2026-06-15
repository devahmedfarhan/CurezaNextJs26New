'use client';

import { useState, useEffect } from 'react';
import { 
    Star, Video, Calendar, Clock, MapPin, Search, Sparkles, 
    ChevronRight, Check, Users, Award, ShieldCheck, Heart, 
    FileText, Activity, Sliders, DollarSign, ArrowRight,
    Leaf, Microscope, Droplet, Scroll, Sprout, ShieldAlert
} from 'lucide-react';
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

    const getDoctorConcerns = (specialization: string) => {
        const spec = specialization.toLowerCase();
        if (spec.includes('skin') || spec.includes('hair') || spec.includes('dermat')) {
            return ['Acne & Pigmentation', 'Hair Fall', 'Eczema & Rashes'];
        }
        if (spec.includes('digest') || spec.includes('gut') || spec.includes('gastro') || spec.includes('stomach')) {
            return ['IBS & Bloating', 'Acidity & Reflux', 'Chronic Constipation'];
        }
        if (spec.includes('stress') || spec.includes('anxiety') || spec.includes('mental') || spec.includes('psych')) {
            return ['Anxiety & Stress', 'Sleep Issues/Insomnia', 'Chronic Fatigue'];
        }
        if (spec.includes('women') || spec.includes('gynae') || spec.includes('hormon')) {
            return ['PCOS / PCOD', 'Irregular Periods', 'Thyroid Imbalance'];
        }
        if (spec.includes('ayur') || spec.includes('panchakarma')) {
            return ['Dosha Balancing', 'Joint Pain & Arthritis', 'Immunity Boost'];
        }
        return ['General Wellness', 'Lifestyle Coaching', 'Immunity Restoration'];
    };

    const getDoctorSystemBadge = (specialization: string) => {
        const spec = specialization.toLowerCase();
        if (spec.includes('ayur')) {
            return { label: 'AYUSH / Ayurvedic', style: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Leaf };
        }
        if (spec.includes('homeo')) {
            return { label: 'Homeopathic', style: 'bg-purple-50 text-purple-700 border-purple-100', icon: Droplet };
        }
        if (spec.includes('cbd') || spec.includes('canna') || spec.includes('hemp')) {
            return { label: 'Hemp/CBD Panel', style: 'bg-teal-50 text-teal-800 border-teal-100', icon: Sprout };
        }
        if (spec.includes('unani')) {
            return { label: 'Unani Practice', style: 'bg-amber-50 text-amber-800 border-amber-100', icon: Scroll };
        }
        return { label: 'Allopathic / MD', style: 'bg-blue-50 text-blue-700 border-blue-100', icon: Microscope };
    };

    const dashboardFeatures = [
        {
            title: "Smart E-Prescription Pad",
            description: "Generate digitized legal prescriptions. Configure precise dosage instructions, specify Ayush remedies or certified medicines, and direct them instantly to patient dashboards.",
            icon: FileText,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
            badge: "E-Prescriptions"
        },
        {
            title: "Secure HD Video Consultation",
            description: "Consult with patients directly via encrypted, low-latency video feeds built right inside the browser. No external links or apps required.",
            icon: Video,
            color: "text-blue-600 bg-blue-50 border-blue-100",
            badge: "Telehealth Hub"
        },
        {
            title: "Patient Health Records (EHR)",
            description: "Access structured patient history logs, past diagnostic reports, ongoing concerns, and medication timelines securely before and during consultations.",
            icon: Activity,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
            badge: "Digital Records"
        },
        {
            title: "Dynamic Slot Scheduler",
            description: "Complete control over your calendar. Easily define consultation timings, configure leave days, set consultation slot gaps, and block instant bookings.",
            icon: Sliders,
            color: "text-purple-600 bg-purple-50 border-purple-100",
            badge: "Availability Control"
        },
        {
            title: "Automated Weekly Payouts",
            description: "Full visibility over completed consultations, patient bookings, and revenue. Settlements are automatically processed to your bank ledger.",
            icon: DollarSign,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            badge: "Settlements Desk"
        },
        {
            title: "Reviews & Patient Sentiments",
            description: "Collect ratings and reviews from happy patients to build authority and enhance your organic listing rank within our specialist index.",
            icon: Star,
            color: "text-rose-600 bg-rose-50 border-rose-100",
            badge: "Reputation Manager"
        }
    ];

    const medicalSystems = [
        {
            title: "Ayurvedic Medicine & AYUSH",
            description: "Focus on classical dosha balancing, herbal formulation guides, and customized lifestyle regimens.",
            doctors: "Ayurvedic Practitioners",
            icon: Leaf,
            color: "from-emerald-50 to-teal-50 border-emerald-100 text-emerald-800"
        },
        {
            title: "Allopathic Practice",
            description: "Evidence-based clinical treatments, diagnostic screenings, and modern pharmaceutical solutions.",
            doctors: "MDs & MBBS Specialists",
            icon: Microscope,
            color: "from-blue-50 to-indigo-50 border-blue-100 text-blue-800"
        },
        {
            title: "Homeopathy & Natural Care",
            description: "Individualized remedies targeting dilution treatments, immunity restoration, and root-cause solutions.",
            doctors: "BHMS Doctors",
            icon: Droplet,
            color: "from-purple-50 to-pink-50 border-purple-100 text-purple-800"
        },
        {
            title: "Unani & Traditional Arts",
            description: "Traditional healing methodologies balancing bodily fluids (akhlat) and restoring natural metabolic order.",
            doctors: "BUMS Specialists",
            icon: Scroll,
            color: "from-amber-50 to-orange-50 border-amber-100 text-amber-800"
        },
        {
            title: "Cannabis & CBD Medicine",
            description: "Licensed medical professionals prescribing calibrated phytocannabinoids, oils, and therapeutics.",
            doctors: "CBD Specialist Panel",
            icon: Sprout,
            color: "from-teal-50 to-green-50 border-teal-100 text-teal-900"
        }
    ];

    const trustStats = [
        { value: "10,000+", label: "Vetted Specialists" },
        { value: "250K+", label: "Completed Sessions" },
        { value: "4.9/5", label: "Patient Rating Score" },
        { value: "Weekly", label: "Earnings Settlement" }
    ];

    return (
        <div className="bg-[#F8F3EF] min-h-screen text-[#052326]">
            
            {/* HERO SECTION */}
            <section className="relative bg-[#052326] text-white py-28 overflow-hidden">
                {/* Background Details */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00bba7]/10 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00bba7]/15 blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Hero Left Content */}
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-[#00bba7] tracking-wider uppercase">
                                <Sparkles size={14} className="animate-pulse" />
                                Premium Telehealth & Clinical Workspace
                            </div>

                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight font-heading">
                                Join India's Elite <span className="text-[#00bba7]">Clinical Wellness Network</span>
                            </h1>

                            <p className="text-lg md:text-xl text-[#F8F3EF]/85 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                                Consulting patients, writing digital prescriptions, and building your clinical authority has never been this seamless. Join Cureza today.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                                <Button
                                    onClick={() => {
                                        const el = document.getElementById('directory-section');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-8 py-6 bg-[#00bba7] text-[#101828] font-bold rounded-[10px] hover:bg-[#101828] hover:text-[#00bba7] hover:border-[#00bba7] border border-transparent transition duration-300 text-xs capitalize tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00bba7]/10"
                                >
                                    Book a Specialist
                                    <ChevronRight size={16} />
                                </Button>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => router.push('/doctor/register')}
                                        className="px-6 py-6 bg-transparent border border-white/20 text-white font-bold rounded-[10px] hover:bg-white/10 transition duration-300 text-xs capitalize tracking-wider flex items-center justify-center"
                                    >
                                        Practitioner Signup
                                    </Button>
                                    <Button
                                        onClick={() => router.push('/doctor/login')}
                                        className="px-6 py-6 bg-white/5 border border-white/10 text-[#00bba7] hover:text-white font-bold rounded-[10px] hover:bg-white/10 transition duration-300 text-xs capitalize tracking-wider flex items-center justify-center"
                                    >
                                        Doctor Login
                                    </Button>
                                </div>
                            </div>

                            {/* Trust Stats banner */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
                                {trustStats.map((stat, i) => (
                                    <div key={i} className="text-center lg:text-left">
                                        <div className="text-2xl md:text-3xl font-extrabold text-[#00bba7] font-heading">{stat.value}</div>
                                        <div className="text-xs text-[#F8F3EF]/60 font-medium mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero Right Image / Graphic */}
                        <div className="flex-1 flex justify-center relative w-full max-w-[480px]">
                            {/* Glow Effects */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#00bba7]/20 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                            
                            {/* Premium Animated Dashboard Vector Mockup */}
                            <div className="relative w-full aspect-[4/3] bg-[#052326]/60 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md p-5 overflow-hidden animate-dashboard-float">
                                <style dangerouslySetInnerHTML={{ __html: `
                                    @keyframes dashboard-float {
                                        0%, 100% { transform: translateY(0px); }
                                        50% { transform: translateY(-10px); }
                                    }
                                    @keyframes float-icon-1 {
                                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                                        50% { transform: translateY(-15px) rotate(3deg); }
                                    }
                                    @keyframes float-icon-2 {
                                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                                        50% { transform: translateY(-10px) rotate(-3deg); }
                                    }
                                    .animate-dashboard-float {
                                        animation: dashboard-float 6s ease-in-out infinite;
                                    }
                                    .animate-float-1 {
                                        animation: float-icon-1 5s ease-in-out infinite;
                                    }
                                    .animate-float-2 {
                                        animation: float-icon-2 5.5s ease-in-out infinite;
                                    }
                                `}} />

                                {/* Mockup Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[10px] text-white/45 font-mono ml-2">Cureza Clinical Suite v1.4</span>
                                    </div>
                                    <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-[#00bba7] font-semibold tracking-wider uppercase">
                                        Active
                                    </div>
                                </div>

                                {/* Mockup Content */}
                                <div className="grid grid-cols-12 gap-4 mt-4 h-full">
                                    {/* Sidebar */}
                                    <div className="col-span-3 border-r border-white/5 pr-3 space-y-3">
                                        <div className="h-6 w-full bg-white/5 rounded-md flex items-center px-2 gap-1.5 border border-white/10">
                                            <div className="w-3 h-3 rounded-sm bg-[#00bba7]/20"></div>
                                            <div className="w-10 h-1.5 bg-white/25 rounded"></div>
                                        </div>
                                        <div className="h-4 w-full bg-white/5 rounded flex items-center px-2 gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-white/10"></div>
                                            <div className="w-8 h-1 bg-white/25 rounded"></div>
                                        </div>
                                        <div className="h-4 w-full bg-white/5 rounded flex items-center px-2 gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-white/10"></div>
                                            <div className="w-8 h-1 bg-white/25 rounded"></div>
                                        </div>
                                    </div>

                                    {/* Main Console */}
                                    <div className="col-span-9 space-y-3">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <div className="text-[8px] text-white/45 uppercase tracking-wider">Upcoming Session</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="text-[11px] font-bold text-white">Consultation: Rohan Verma</div>
                                                <span className="text-[9px] text-[#00bba7] bg-[#00bba7]/10 px-1.5 py-0.5 rounded">Join Room</span>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
                                            <div className="text-[8px] text-white/45 uppercase tracking-wider">Prescription Pad</div>
                                            <div className="space-y-1.5">
                                                <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                                                <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                                                <div className="h-2 w-5/6 bg-white/10 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card 1: Doctor Recommendation */}
                            <div className="absolute top-[-20px] left-[-30px] bg-white text-[#052326] p-3 rounded-xl border border-[#052326]/10 shadow-xl flex items-center gap-3 animate-float-1 z-20">
                                <div className="p-2 bg-emerald-50 text-[#00bba7] rounded-lg">
                                    <Video size={18} />
                                </div>
                                <div>
                                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Tele-Consulting</div>
                                    <div className="text-xs font-bold text-emerald-700">HD Video Secured</div>
                                </div>
                            </div>

                            {/* Floating Card 2: Sales Notification */}
                            <div className="absolute bottom-[-15px] right-[-20px] bg-[#101828] text-white p-3 rounded-xl border border-white/10 shadow-2xl flex items-center gap-3 animate-float-2 z-20">
                                <div className="p-2 bg-[#00bba7]/10 text-[#00bba7] rounded-lg">
                                    <Award size={18} />
                                </div>
                                <div>
                                    <div className="text-[8px] font-bold text-[#00bba7] uppercase tracking-wider">Certified Practice</div>
                                    <div className="text-xs font-bold">Ayush & MCI Verified</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DIRECTORY SECTION (Now 2nd section - ULTRA PREMIUM REDESIGN) */}
            <section id="directory-section" className="py-24 bg-white border-b border-[#052326]/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Verified Specialist Roster Live
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#052326] tracking-tight font-heading">
                            Consult Certified Specialists Online
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                            Search from India's vetted medical panel across Ayurveda, Allopathy, and Homeopathy systems. Connect with secure HD video links.
                        </p>
                    </div>

                    {/* Search Panel with premium backdrop */}
                    <div className="mb-16 space-y-6 max-w-7xl mx-auto bg-[#F8F3EF]/50 p-4 md:p-6 rounded-2xl border border-[#052326]/8 shadow-[0_10px_30px_rgba(5,35,38,0.03)]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#052326]/40 h-5 w-5" />
                            <Input
                                placeholder="Search by practitioner name, medical system (e.g. Ayush, MD) or symptom tags..."
                                className="pl-12 h-14 rounded-[12px] border-[#052326]/12 bg-white text-sm focus:ring-2 focus:ring-[#00bba7]/40 placeholder-[#052326]/30 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {/* Specialty Filter Buttons */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
                            {specialties.map((filter) => {
                                const isActive = activeSpecialty === filter;
                                return (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveSpecialty(filter)}
                                        className={`px-5 py-2.5 rounded-[10px] whitespace-nowrap border text-xs font-semibold uppercase tracking-wider transition-all duration-200 select-none ${
                                            isActive
                                                ? 'bg-[#052326] text-[#F8F3EF] border-[#052326] shadow-md shadow-[#052326]/10'
                                                : 'bg-white text-[#052326]/75 border-[#052326]/10 hover:border-[#052326]/20 hover:bg-[#F8F3EF]/40'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Doctor Cards Grid */}
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <div className="text-center py-24 text-sm text-[#052326]/50 font-light flex flex-col items-center gap-3">
                                <div className="w-9 h-9 rounded-full border-[3px] border-t-transparent border-[#00bba7] animate-spin"></div>
                                <span>Loading verified medical practitioners...</span>
                            </div>
                        ) : filteredDoctors.length === 0 ? (
                            <div className="text-center py-20 border border-[#052326]/10 rounded-2xl bg-white shadow-premium-light max-w-xl mx-auto">
                                <div className="text-3xl mb-3">🔍</div>
                                <h4 className="font-bold text-[#052326] text-base mb-1">No matches found</h4>
                                <p className="text-xs text-[#052326]/50 font-light">Try adjusting your filters or spelling for search queries.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredDoctors.map((doctor) => {
                                    const system = getDoctorSystemBadge(doctor.specialization);
                                    const SystemIcon = system.icon;
                                    const concerns = getDoctorConcerns(doctor.specialization);
                                    
                                    return (
                                        <div 
                                            key={doctor.id} 
                                            className="bg-white rounded-2xl border border-[#052326]/10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(5,35,38,0.08)] hover:border-[#00bba7]/40 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden"
                                        >
                                            {/* Glowing Top Bar on Hover */}
                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00bba7]/80 to-[#052326]/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                                            <div>
                                                {/* Header Row */}
                                                <div className="flex justify-between items-start mb-4">
                                                    {/* Medical System Badge */}
                                                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border text-[9px] font-bold uppercase tracking-wider ${system.style}`}>
                                                        <SystemIcon size={10} />
                                                        {system.label}
                                                    </div>

                                                    {/* Rating badge */}
                                                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-[4px] text-[11px] font-bold">
                                                        <span>{doctor.rating ? Number(doctor.rating).toFixed(1) : '5.0'}</span>
                                                        <Star size={10} fill="currentColor" className="text-emerald-700" />
                                                    </div>
                                                </div>

                                                {/* Profile Block */}
                                                <div className="flex items-start gap-4 mb-5">
                                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#052326]/10 bg-slate-50 group-hover:border-[#00bba7]/40 transition-colors">
                                                        {doctor.profile_photo_url ? (
                                                            <Image src={doctor.profile_photo_url} alt={doctor.name} width={64} height={64} className="object-cover h-full w-full" />
                                                        ) : (
                                                            <span className="text-2xl">👨‍⚕️</span>
                                                        )}
                                                        {/* Active Status Ring */}
                                                        <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-extrabold text-base text-[#052326] group-hover:text-[#00bba7] transition-colors truncate">
                                                            {doctor.name}
                                                        </h3>
                                                        <p className="text-[#052326]/60 text-xs font-semibold uppercase tracking-wider mt-0.5 truncate">
                                                            {doctor.specialization}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-[#052326]/40 text-[10px] mt-1">
                                                            <Award size={11} className="text-[#00bba7]" />
                                                            <span>{doctor.years_of_experience}+ Years Experience</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Treated Concerns Tags Section */}
                                                <div className="mb-6 space-y-1.5">
                                                    <p className="text-[9px] text-[#052326]/40 uppercase font-bold tracking-wider">Top Concerns Treated</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {concerns.map((concern, idx) => (
                                                            <span key={idx} className="text-[9px] font-medium bg-[#F8F3EF] text-[#052326]/70 px-2 py-1 rounded-[6px] border border-[#052326]/5 group-hover:border-[#00bba7]/20 transition-colors">
                                                                {concern}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action / Booking Row */}
                                            <div className="border-t border-[#052326]/8 pt-4 flex items-center justify-between mt-auto">
                                                <div>
                                                    <p className="text-[9px] text-[#052326]/40 uppercase font-bold tracking-wider">Fee per session</p>
                                                    <p className="font-extrabold text-base text-[#052326]">₹{doctor.consultation_fee || '499'}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline"
                                                        onClick={() => router.push(`/doctor/${doctor.id}`)}
                                                        className="border-[#052326]/15 text-[#052326] hover:bg-[#052326]/5 hover:text-[#052326] px-3 h-9 rounded-[10px] text-[10px] font-bold uppercase tracking-wider transition-all"
                                                    >
                                                        View Profile
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleBookNow(doctor)}
                                                        className="bg-[#052326] text-[#F8F3EF] hover:bg-[#00bba7] hover:text-[#101828] gap-1 px-4.5 h-9 rounded-[10px] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center"
                                                    >
                                                        <Calendar size={11} /> Book Slots
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* MEDICAL SYSTEMS & DOMAINS */}
            <section className="py-24 bg-[#F8F3EF] border-b border-[#052326]/5">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#00bba7] text-xs font-bold uppercase tracking-widest block">Complete Medical Care</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#052326] font-heading">
                            Our Diversified Clinical Ecosystem
                        </h2>
                        <p className="text-gray-500 text-base">
                            Whether seeking natural wisdom, homeopathy, modern pharmaceuticals, or target CBD therapies, connect with specialists across all legal medical systems in India.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {medicalSystems.map((system, i) => {
                            const IconComponent = system.icon;
                            return (
                                <div 
                                    key={i}
                                    className={`p-6 bg-gradient-to-b ${system.color} rounded-[12px] border border-[#052326]/8 flex flex-col justify-between space-y-4 hover:shadow-md transition duration-300`}
                                >
                                    <div className="space-y-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm border border-[#052326]/8 text-[#00bba7]">
                                            <IconComponent size={20} />
                                        </div>
                                        <h3 className="font-bold text-base tracking-tight">{system.title}</h3>
                                        <p className="text-xs opacity-80 leading-relaxed font-light">{system.description}</p>
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider bg-black/5 px-2.5 py-1 rounded w-max">
                                        {system.doctors}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* DASHBOARD FEATURES FOR DOCTORS */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#00bba7] text-xs font-bold uppercase tracking-widest block">Dashboard Utilities</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#052326] font-heading">
                            The Advanced Doctor Command Suite
                        </h2>
                        <p className="text-gray-600 text-base">
                            Everything you need to run an optimized digital clinic is included in your active clinician panel.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {dashboardFeatures.map((feat, i) => {
                            const IconComponent = feat.icon;
                            return (
                                <div 
                                    key={i}
                                    className="bg-[#F8F3EF]/30 p-8 rounded-[12px] border border-[#052326]/8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#00bba7]/55 transition duration-300 flex flex-col justify-between"
                                >
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className={`p-3 rounded-[10px] ${feat.color}`}>
                                                <IconComponent size={22} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase mt-1">
                                                {feat.badge}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold text-[#052326] font-heading">{feat.title}</h3>
                                            <p className="text-gray-500 text-xs leading-relaxed">{feat.description}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#052326]">
                                        <span>Included in Console</span>
                                        <Check size={14} className="text-[#00bba7]" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* PRACTITIONER CALL TO ACTION */}
            <section className="py-24 bg-[#052326] text-white border-t border-white/5 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="container mx-auto px-6 relative z-10 space-y-6 max-w-3xl">
                    <span className="text-[#00bba7] text-xs font-bold uppercase tracking-widest block">Become a Cureza Practitioner</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold font-heading">
                        Start Your Digital Practice Today
                    </h2>
                    <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
                        Consult with health-conscious individuals across India. Set your custom fees, manage schedules, and coordinate patient treatments from our verified workspace.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button 
                            onClick={() => router.push('/doctor/register')}
                            className="bg-[#00bba7] text-[#101828] hover:bg-[#00bba7]/90 font-bold px-8 h-12 rounded-[10px] text-xs uppercase tracking-wider transition-all"
                        >
                            Register as Doctor
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => router.push('/doctor/login')}
                            className="bg-transparent text-white border-white/20 hover:bg-white/10 font-bold px-8 h-12 rounded-[10px] text-xs uppercase tracking-wider transition-all"
                        >
                            Doctor Sign In
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    );
}
