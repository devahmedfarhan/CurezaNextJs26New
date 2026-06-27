'use client';

import { useState, useEffect } from 'react';
import { 
    Users, Calendar, DollarSign, Clock, ArrowRight, Sparkles, 
    Activity, FileText, ChevronRight, Stethoscope, Video, MessageSquare, Plus
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function DoctorDashboardPage() {
    const { showToast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [userRes, summaryRes] = await Promise.all([
                api.get('/user'),
                api.get('/doctor/dashboard/summary')
            ]);
            
            setUser(userRes.data);
            setSummary(summaryRes.data.summary);
            setAppointments(summaryRes.data.appointments || []);
        } catch (error) {
            console.error('Failed to fetch doctor dashboard details:', error);
            showToast('Failed to load dashboard metrics', 'error');
            
            // Demonstrative Fallbacks for UI if API is empty/unseeded
            setSummary({
                total_patients: 0,
                total_appointments: 0,
                total_earnings: 0.00,
                pending_requests: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hrs = new Date().getHours();
        if (hrs < 12) return 'Good Morning';
        if (hrs < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 font-medium animate-pulse">Assembling clinical overview...</p>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Patients",
            value: summary?.total_patients ?? 0,
            description: "Unique consultation ledgers",
            icon: Users,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100/50"
        },
        {
            title: "Appointments booked",
            value: summary?.total_appointments ?? 0,
            description: "Cumulative virtual bookings",
            icon: Calendar,
            color: "text-blue-600 bg-blue-50 border-blue-100/50"
        },
        {
            title: "Net Earnings",
            value: `₹${parseFloat(summary?.total_earnings || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            description: "80% - 85% practitioner share",
            icon: DollarSign,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100/50"
        },
        {
            title: "Pending Requests",
            value: summary?.pending_requests ?? 0,
            description: "Awaiting slot validation",
            icon: Clock,
            color: "text-amber-600 bg-amber-50 border-amber-100/50"
        }
    ];

    return (
        <div className="space-y-4">
            {/* Header Greeting Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-[#052326] to-slate-900 text-white rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="relative z-10 space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        <Sparkles size={11} className="text-emerald-400" />
                        Clinical Workspace Active
                    </div>
                    <h1 className="text-xl md:text-2xl font-black font-heading tracking-tight">
                        {getGreeting()}, Dr. {user?.name || 'Practitioner'}
                    </h1>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                        Monitor patient files, organize virtual clinical consultations, write verified e-prescriptions, and review payouts from your customized medical portal.
                    </p>
                </div>
            </div>

            {/* Metrics Dashboard Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white border border-black/[0.05] rounded-xl p-5 hover:shadow-md transition-all duration-350 flex items-center justify-between group"
                    >
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-lg font-black text-gray-800 tracking-tight group-hover:text-emerald-600 transition-colors">
                                {card.value}
                            </h3>
                            <p className="text-[10px] text-gray-400">{card.description}</p>
                        </div>
                        <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shadow-sm ${card.color}`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Appointments Checklist */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-black/[0.05] rounded-xl p-5">
                        <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 tracking-tight">Today's Schedule & Consultations</h2>
                                <p className="text-[10px] text-gray-400 mt-0.5">Upcoming appointments and patient queue</p>
                            </div>
                            <Link href="/doctor/dashboard/consultations">
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 font-bold uppercase tracking-wider">
                                    Full Schedule
                                    <ChevronRight size={12} className="ml-1" />
                                </Button>
                            </Link>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 mb-3 animate-pulse">
                                    <Activity size={24} />
                                </div>
                                <h4 className="text-xs font-bold text-gray-800">Workspace Clear</h4>
                                <p className="text-[10px] text-gray-400 mt-1 max-w-xs">No active consultations booked for today. You will receive notifications when new bookings are locked.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-black/[0.04]">
                                {appointments.map((appt) => {
                                    const isPending = appt.status.toLowerCase() === 'pending';
                                    const isCompleted = appt.status.toLowerCase() === 'completed';
                                    return (
                                        <div key={appt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center border border-black/[0.04] shrink-0 font-bold text-xs uppercase">
                                                    {appt.patient.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{appt.patient}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                            <Clock size={11} /> {appt.time}
                                                        </span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                            {appt.type.includes('Video') ? <Video size={11} className="text-blue-500" /> : <MessageSquare size={11} className="text-emerald-500" />}
                                                            {appt.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 justify-end sm:justify-start">
                                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wide ${
                                                    isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    isPending ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                    'bg-blue-50 text-blue-700 border border-blue-100'
                                                }`}>
                                                    {appt.status}
                                                </span>
                                                <Link href="/doctor/dashboard/consultations">
                                                    <Button size="sm" className="h-7 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 transition-all cursor-pointer">
                                                        {isCompleted ? 'View RX' : 'Consult Now'}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Action Suite */}
                <div className="space-y-4">
                    <div className="bg-white border border-black/[0.05] rounded-xl p-5">
                        <h2 className="text-sm font-bold text-gray-800 tracking-tight pb-3 border-b border-black/[0.05] mb-4">Quick Workspace Actions</h2>
                        <div className="space-y-2.5">
                            <Link href="/doctor/dashboard/prescriptions" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50/50 border border-black/[0.03] hover:border-emerald-100 rounded-xl transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    <FileText size={15} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800 leading-tight">Write E-Prescription</p>
                                    <p className="text-[9.5px] text-gray-400 truncate mt-0.5">Generate legal RX pads for patients</p>
                                </div>
                                <ArrowRight size={13} className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            <Link href="/doctor/dashboard/consultations" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50/50 border border-black/[0.03] hover:border-emerald-100 rounded-xl transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Stethoscope size={15} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800 leading-tight">Configure Timings</p>
                                    <p className="text-[9.5px] text-gray-400 truncate mt-0.5">Manage schedules and slots</p>
                                </div>
                                <ArrowRight size={13} className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            <Link href="/doctor/dashboard/profile" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50/50 border border-black/[0.03] hover:border-emerald-100 rounded-xl transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <Users size={15} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-800 leading-tight">Practice Credentials</p>
                                    <p className="text-[9.5px] text-gray-400 truncate mt-0.5">Update degrees and clinic files</p>
                                </div>
                                <ArrowRight size={13} className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
