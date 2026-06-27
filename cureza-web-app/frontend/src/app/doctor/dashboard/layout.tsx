'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    Stethoscope, User, LogOut, LayoutDashboard, Users, Calendar as CalendarIcon, 
    DollarSign, Star, LifeBuoy, Settings, Clock, XCircle, Menu, X, FileText, 
    Calculator, Search, Globe 
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

const SEARCHABLE_ITEMS = [
    // Pages
    { type: 'page', label: 'Dashboard Overview', path: '/doctor/dashboard', keywords: 'home dashboard overview main' },
    { type: 'page', label: 'Patient Records', path: '/doctor/dashboard/patients', keywords: 'patients clients lobby queue list' },
    { type: 'page', label: 'Consultations & Bookings', path: '/doctor/dashboard/consultations', keywords: 'consultations appointments video clinic visit bookings agenda' },
    { type: 'page', label: 'Prescriptions Manager', path: '/doctor/dashboard/prescriptions', keywords: 'prescriptions medicine rx script active' },
    { type: 'page', label: 'Clinical Tools & Calculators', path: '/doctor/dashboard/clinical-tools', keywords: 'clinical tools calculators bmi gfr meld score' },
    { type: 'page', label: 'Earnings & Payouts', path: '/doctor/dashboard/earnings', keywords: 'earnings payouts money revenue transactions income financial' },
    { type: 'page', label: 'Patient Reviews & Feedback', path: '/doctor/dashboard/reviews', keywords: 'reviews stars feedback rating patient comment' },
    { type: 'page', label: 'Support & Help Desk', path: '/doctor/dashboard/support', keywords: 'support help issue ticket FAQ' },
    { type: 'page', label: 'Doctor Profile Settings', path: '/doctor/dashboard/profile', keywords: 'profile doctor biological details bio info degree' },
    { type: 'page', label: 'Account & Portal Settings', path: '/doctor/dashboard/settings', keywords: 'settings account security password profile details' },

    // Clinical Tools (calc query param)
    { type: 'tool', label: 'BMI Calculator', path: '/doctor/dashboard/clinical-tools?calc=bmi', keywords: 'bmi calculator body mass index height weight' },
    { type: 'tool', label: 'Dosage Calculator', path: '/doctor/dashboard/clinical-tools?calc=dosage', keywords: 'dosage calculator pediatric adult medicine' },
    { type: 'tool', label: 'GFR Calculator', path: '/doctor/dashboard/clinical-tools?calc=gfr', keywords: 'gfr kidney function creatinine clearance' },
    { type: 'tool', label: 'Pregnancy EDD Calculator', path: '/doctor/dashboard/clinical-tools?calc=pregnancy', keywords: 'pregnancy edd date delivery baby gestation' },
    { type: 'tool', label: 'Blood Pressure Assessment', path: '/doctor/dashboard/clinical-tools?calc=bp', keywords: 'blood pressure bp hypertension cardiovascular cardiovascular health' },
    { type: 'tool', label: 'Glasgow Coma Scale (GCS)', path: '/doctor/dashboard/clinical-tools?calc=gcs', keywords: 'glasgow coma scale gcs neuro conscious trauma' },
    { type: 'tool', label: 'APGAR Score (Newborn)', path: '/doctor/dashboard/clinical-tools?calc=apgar', keywords: 'apgar score newborn infant birth pediatric' },
    { type: 'tool', label: 'Body Surface Area (BSA)', path: '/doctor/dashboard/clinical-tools?calc=bsa', keywords: 'body surface area bsa skin dosage' },
    { type: 'tool', label: 'MELD Score (Liver)', path: '/doctor/dashboard/clinical-tools?calc=meld', keywords: 'meld score liver end stage cirrhosis transplant' },
    { type: 'tool', label: 'Wells Score (DVT/PE)', path: '/doctor/dashboard/clinical-tools?calc=wells', keywords: 'wells score dvt pe thrombosis embolism' },

    // Essential Drugs / Medications
    { type: 'drug', label: 'Paracetamol (Acetaminophen) Dosage Guidance', path: '/doctor/dashboard?search=Paracetamol', keywords: 'paracetamol acetaminophen pain fever dose analgesic' },
    { type: 'drug', label: 'Amoxicillin Antibiotic Guidance', path: '/doctor/dashboard?search=Amoxicillin', keywords: 'amoxicillin penicillin antibiotic ear throat dose' },
    { type: 'drug', label: 'Ibuprofen NSAID Dosage Guidance', path: '/doctor/dashboard?search=Ibuprofen', keywords: 'ibuprofen nsaid pain inflammation advil' },
    { type: 'drug', label: 'Metformin Antidiabetic Guidance', path: '/doctor/dashboard?search=Metformin', keywords: 'metformin antidiabetic biguanide sugar diabetes glucophage' },
    { type: 'drug', label: 'Atorvastatin Lipid-lowering Guidance', path: '/doctor/dashboard?search=Atorvastatin', keywords: 'atorvastatin lipitor statin cholesterol bedtime lipid' },
    { type: 'drug', label: 'Amlodipine CCB Dosage Guidance', path: '/doctor/dashboard?search=Amlodipine', keywords: 'amlodipine calcium channel blocker blood pressure heart' },
    { type: 'drug', label: 'Azithromycin Macrolide Guidance', path: '/doctor/dashboard?search=Azithromycin', keywords: 'azithromycin antibiotic z-pak bacterial infection' },
    { type: 'drug', label: 'Pantoprazole Proton Pump Inhibitor Guidance', path: '/doctor/dashboard?search=Pantoprazole', keywords: 'pantoprazole ppi acid reflux gerd stomach breakfast' },
    { type: 'drug', label: 'Salbutamol Bronchodilator Guidance', path: '/doctor/dashboard?search=Salbutamol', keywords: 'salbutamol albuterol asthma inhaler breathing' },
    { type: 'drug', label: 'Cetirizine Antihistamine Guidance', path: '/doctor/dashboard?search=Cetirizine', keywords: 'cetirizine allergy antihistamine zyrtec runny nose' },

    // Patients in waiting room/queue
    { type: 'patient', label: 'Patient Record: Farhan Ahmed', path: '/doctor/dashboard?search=Farhan', keywords: 'farhan ahmed waiting lobby consult' },
    { type: 'patient', label: 'Patient Record: Priya Sharma', path: '/doctor/dashboard?search=Priya', keywords: 'priya sharma lobby wait session' },
    { type: 'patient', label: 'Patient Record: John Doe', path: '/doctor/dashboard?search=John', keywords: 'john doe consult lobby wait' }
];

const navItems = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/doctor/dashboard/patients', label: 'Patients', icon: Users },
    { href: '/doctor/dashboard/consultations', label: 'Consultations', icon: CalendarIcon },
    { href: '/doctor/dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
    { href: '/doctor/dashboard/clinical-tools', label: 'Clinical Tools', icon: Calculator },
    { href: '/doctor/dashboard/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/doctor/dashboard/reviews', label: 'Reviews', icon: Star },
    { href: '/doctor/dashboard/support', label: 'Support', icon: LifeBuoy },
    { href: '/doctor/dashboard/profile', label: 'Profile', icon: User },
    { href: '/doctor/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    interface User {
        id: string;
        name: string;
        email: string;
        role: 'doctor' | 'patient';
        profile_image_url?: string;
        doctor_status?: 'draft' | 'pending' | 'otp_verified' | 'under_review' | 'approved' | 'rejected';
    }
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/doctor/login');
                return;
            }

            const response = await api.get('/user');
            if (response.data.role !== 'doctor') {
                router.push('/doctor/login');
                return;
            }

            if (response.data.doctor_status !== 'approved') {
                setUser(response.data);
                setLoading(false);
                return;
            }

            setUser(response.data);
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/doctor/login');
        } finally {
            setLoading(false);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchFocused, setSearchFocused] = useState(false);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        if (!val.trim()) {
            setSearchResults([]);
            return;
        }
        const filtered = SEARCHABLE_ITEMS.filter(item => 
            item.label.toLowerCase().includes(val.toLowerCase()) ||
            item.keywords.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 6);
        setSearchResults(filtered);
    };

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;
        router.push(`/doctor/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await api.post('/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Logout API failed:', error);
            }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        router.push('/doctor/login');
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(href + '/');
    };

    if (loading || !user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/80">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400 font-medium">Loading portal…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/80 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-black/[0.05] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo-black-no-tagline.svg" alt="Cureza Logo" className="h-6 w-auto object-contain dark:invert" />
                    <span className="font-bold text-sm text-gray-800 tracking-tight">Cureza</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100"
                >
                    {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </header>

            {/* Sidebar Overlay for Mobile */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-[220px] bg-white border-r border-black/[0.05] flex flex-col
                fixed md:sticky md:top-0 inset-y-0 left-0 z-40 h-screen
                transform md:transform-none transition-transform duration-200 ease-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="px-4 py-4 border-b border-black/[0.05] hidden md:flex flex-col items-center">
                    <Link href="/" className="flex flex-col items-center gap-1 group w-full text-center">
                        <img src="/logo-black-no-tagline.svg" alt="Cureza Logo" className="h-6.5 w-auto object-contain dark:invert transition-transform group-hover:scale-105" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mt-2 bg-emerald-50/50 px-2.5 py-0.5 rounded-full border border-emerald-100">Doctor Portal</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto mt-14 md:mt-0">
                    {/* Mobile Search Bar */}
                    <div className="md:hidden px-2 pb-3 pt-1 relative z-50">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchSubmit();
                                        setMobileMenuOpen(false);
                                    }
                                }}
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-black/[0.05] focus:border-emerald-500 rounded-md text-[10px] outline-none transition-colors"
                            />
                        </div>
                        {searchFocused && searchResults.length > 0 && (
                            <div className="absolute left-2 right-2 mt-1 bg-white border border-black/[0.05] rounded-md shadow-lg overflow-hidden z-50 divide-y divide-black/[0.03] max-h-48 overflow-y-auto">
                                {searchResults.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onMouseDown={() => {
                                            router.push(item.path);
                                            setSearchQuery('');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full text-left p-2 hover:bg-gray-50 text-[9.5px] font-medium text-gray-600 flex justify-between items-center transition-colors"
                                    >
                                        <span className="truncate pr-1">{item.label}</span>
                                        <span className="text-[7.5px] font-bold px-1.5 py-0.5 rounded shrink-0 bg-gray-50 text-gray-500 uppercase">
                                            {item.type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="px-2.5 pt-1 pb-2 text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
                    {navItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                href={item.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                                    active
                                        ? 'bg-emerald-50/80 text-emerald-700 font-bold'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                <item.icon size={16} className={active ? 'text-emerald-600' : 'text-gray-400'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Card */}
                <div className="px-3 pb-3 border-t border-black/[0.05] pt-3">
                    <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1.5 bg-gray-50/80 rounded-md border border-black/[0.05]">
                        <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-black/[0.05] flex-shrink-0">
                            <User size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">{user?.name}</p>
                            <p className="text-[10px] text-gray-400 truncate leading-tight">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-red-500 hover:text-red-600 hover:bg-red-50/60 rounded-md text-[11px] font-medium transition-all duration-150"
                    >
                        <LogOut size={13} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
                {/* Desktop Sticky Header */}
                <header className="hidden md:flex bg-white border-b border-black/[0.05] h-14 items-center justify-between px-6 sticky top-0 z-30 shrink-0">
                    {/* Left: Global Search Bar */}
                    <div className="relative w-80">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search patients, tools, drugs..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchSubmit();
                                    }
                                }}
                                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-black/[0.05] focus:border-emerald-500 rounded-md text-[11px] outline-none transition-colors"
                            />
                        </div>

                        {/* Autocomplete Suggestions */}
                        {searchFocused && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-black/[0.05] rounded-md shadow-lg overflow-hidden z-50 divide-y divide-black/[0.03] max-h-60 overflow-y-auto">
                                {searchResults.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onMouseDown={() => {
                                            router.push(item.path);
                                            setSearchQuery('');
                                        }}
                                        className="w-full text-left p-2 hover:bg-gray-50 text-[10px] font-medium text-gray-600 flex justify-between items-center transition-colors"
                                    >
                                        <span className="truncate pr-2">{item.label}</span>
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                                            item.type === 'page' ? 'bg-blue-50 text-blue-600' :
                                            item.type === 'tool' ? 'bg-purple-50 text-purple-600' :
                                            item.type === 'drug' ? 'bg-emerald-50 text-emerald-600' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                            {item.type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Premium Links Stack */}
                    <div className="flex items-center gap-4">
                        {/* Website Home */}
                        <Link 
                            href="/"
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                            title="Go to main website home"
                        >
                            <Globe size={13} className="text-gray-400 group-hover:text-emerald-600" />
                            <span>Website Home</span>
                        </Link>

                        <span className="w-px h-4 bg-black/[0.05]"></span>

                        {/* Payouts */}
                        <Link 
                            href="/doctor/dashboard/earnings"
                            className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                                pathname === '/doctor/dashboard/earnings' ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'
                             }`}
                        >
                            <DollarSign size={13} />
                            <span>Payouts</span>
                        </Link>

                        {/* Profile */}
                        <Link 
                            href="/doctor/dashboard/profile"
                            className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                                pathname === '/doctor/dashboard/profile' ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'
                             }`}
                        >
                            <User size={13} />
                            <span>Profile</span>
                        </Link>

                        {/* Settings */}
                        <Link 
                            href="/doctor/dashboard/settings"
                            className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                                pathname === '/doctor/dashboard/settings' ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'
                             }`}
                        >
                            <Settings size={13} />
                            <span>Settings</span>
                        </Link>

                        <span className="w-px h-4 bg-black/[0.05]"></span>

                        {/* Sign Out */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={13} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-6 w-full max-w-7xl mx-auto flex-1">
                    {user?.doctor_status !== 'approved' ? (
                        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-5 max-w-xl mx-auto bg-white p-6 rounded-lg border border-black/[0.05] my-4">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${user?.doctor_status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {user?.doctor_status === 'rejected' ? <XCircle size={32} /> : <Clock size={32} />}
                            </div>
                            <div className="space-y-1.5 max-w-md">
                                <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                                    {user?.doctor_status === 'rejected' ? 'Action Required' : 'Account Under Review'}
                                </h1>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {user?.doctor_status === 'rejected'
                                        ? 'Some documents did not meet verification standards. Please review and reupload.'
                                        : 'Our medical board is verifying your credentials. This typically takes 24-48 hours.'}
                                </p>
                            </div>

                            {/* KYC Panel */}
                            <div className="w-full text-left bg-gray-50/80 p-4 rounded-lg border border-black/[0.05] space-y-3">
                                <h3 className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">KYC Document Check</h3>
                                <div className="divide-y divide-black/[0.05]">
                                    {[
                                        { label: 'Profile Photo', key: 'profile_photo', status: user?.profile_photo_status || 'pending', reason: user?.profile_photo_rejection_reason },
                                        { label: 'Medical License', key: 'license_doc', status: user?.license_doc_status || 'pending', reason: user?.license_doc_rejection_reason },
                                        { label: 'Government ID', key: 'identity_proof', status: user?.identity_proof_status || 'pending', reason: user?.identity_proof_rejection_reason },
                                        ...(user?.ayush_document_path ? [{ label: 'Ayush Certificate', key: 'ayush_document', status: user?.ayush_document_status || 'pending', reason: user?.ayush_document_rejection_reason }] : [])
                                    ].map((doc) => (
                                        <div key={doc.key} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-medium text-gray-700">{doc.label}</p>
                                                {doc.status === 'rejected' && doc.reason && (
                                                    <p className="text-[10px] text-red-500 bg-red-50/80 p-1.5 rounded border border-red-100/60 mt-1">
                                                        {doc.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                                                    doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                    doc.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {doc.status}
                                                </span>
                                                {doc.status === 'rejected' && (
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            id={`reupload-${doc.key}`}
                                                            className="hidden"
                                                            accept={doc.key === 'profile_photo' ? 'image/*' : 'image/*,application/pdf'}
                                                            onChange={async (e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    const file = e.target.files[0];
                                                                    const formData = new FormData();
                                                                    formData.append('document_type', doc.key);
                                                                    formData.append('file', file);
                                                                    try {
                                                                        setLoading(true);
                                                                        const res = await api.post('/doctor/reupload-document', formData, {
                                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                                        });
                                                                        setUser(res.data.user);
                                                                        alert(`${doc.label} reuploaded successfully!`);
                                                                    } catch (err: any) {
                                                                        alert(err.response?.data?.message || 'Upload failed.');
                                                                    } finally {
                                                                        setLoading(false);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`reupload-${doc.key}`}
                                                            className="cursor-pointer inline-flex items-center justify-center h-7 px-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-colors"
                                                        >
                                                            Reupload
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-3">
                                <Button variant="outline" onClick={handleLogout} className="h-9 px-6 text-[11px] font-semibold rounded-md border-black/[0.05]">Sign Out</Button>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </main>
        </div>
    );
}
